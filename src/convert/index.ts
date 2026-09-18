#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  APP_UI_META,
  fitStructuredForChat,
  logoImageContent,
  registerAppTool,
  registerParadocsConvertAppResource,
} from "../appsUi.js";
import {
  convertFile,
  convertFolder,
  resolveFolderOutput,
  resolveOutputPath,
} from "./engine.js";
import {
  createJob,
  getJobStatusPayload,
  loadJob,
  progressFileForJob,
  runJob,
  updateJob,
} from "./jobs.js";
import { getBundledProfile, listBundledProfiles } from "./profiles.js";

function textResult(payload: unknown) {
  const structured =
    typeof payload === "object" && payload !== null
      ? ({ ...(payload as Record<string, unknown>) } as Record<string, unknown>)
      : { view: "result", text: String(payload) };

  const ui = fitStructuredForChat(structured);
  const text = JSON.stringify(ui, null, 2);

  return {
    content: [logoImageContent(), { type: "text" as const, text }],
    structuredContent: ui,
    _meta: { ...APP_UI_META },
  };
}

function errorResult(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return {
    content: [logoImageContent(), { type: "text" as const, text: `Error: ${message}` }],
    isError: true,
    _meta: { ...APP_UI_META },
  };
}

const server = new McpServer({
  name: "paradocs-convert",
  version: "0.2.0",
});

registerParadocsConvertAppResource(server);

registerAppTool(
  server,
  "convert_file",
  {
    title: "Convert one Word/PDF file to Markdown",
    description:
      "Convert a single .docx, .docm, or .pdf file to Markdown using the bundled ParaDOCS text engine. Provide inputPath and optional outputPath (defaults beside the source or PARADOCS_DEFAULT_OUTPUT_DIR). Legacy .doc is skipped. Returns jobId for long runs; small files usually finish inline.",
    inputSchema: {
      inputPath: z.string().describe("Absolute or workspace-relative path to the source file"),
      outputPath: z
        .string()
        .optional()
        .describe("Destination .md path. Defaults to same basename as input."),
      profile: z
        .string()
        .optional()
        .describe('Bundled ripping profile name (default, Main, …). Use list_settings_profiles.'),
      overwrite: z.boolean().optional().describe("Replace an existing output file (default false)."),
      async: z
        .boolean()
        .optional()
        .describe("Run in background and poll job_status (default false for single files)."),
    },
    _meta: APP_UI_META,
  },
  async ({ inputPath, outputPath, profile, overwrite, async: runAsync }) => {
    try {
      const resolved = resolveOutputPath(inputPath, outputPath);
      const job = createJob({
        kind: "file",
        profile: profile ?? "default",
        inputPath: resolved.input,
        outputPath: resolved.output,
        message: "Queued file conversion.",
      });

      const execute = async () => {
        const result = await convertFile({
          inputPath: resolved.input,
          outputPath: resolved.output,
          profile,
          overwrite,
        });
        return result;
      };

      if (runAsync) {
        void runJob(job.id, execute, (result) => ({
          result: result as Record<string, unknown>,
          outputPath: String(result.output ?? resolved.output),
          message:
            result.status === "ok"
              ? `Wrote ${result.output}`
              : result.status === "skipped"
                ? `Skipped: ${result.reason ?? "unknown"}`
                : `Failed: ${result.error ?? "unknown"}`,
        }));
        return textResult({
          view: "convert_progress",
          status: "queued",
          jobId: job.id,
          profile: profile ?? "default",
          inputPath: resolved.input,
          outputPath: resolved.output,
          message: "File conversion started. Poll job_status for progress.",
        });
      }

      const result = await execute();
      updateJob(job.id, {
        status: result.status === "failed" ? "failed" : "completed",
        result: result as Record<string, unknown>,
        message:
          result.status === "ok"
            ? `Wrote ${result.output}`
            : result.status === "skipped"
              ? `Skipped: ${result.reason ?? "unknown"}`
              : `Failed: ${result.error ?? "unknown"}`,
      });

      return textResult({
        view: "convert_result",
        status: result.status,
        jobId: job.id,
        profile: result.profile ?? profile ?? "default",
        inputPath: result.source ?? resolved.input,
        outputPath: result.output ?? resolved.output,
        chars: result.chars,
        reason: result.reason,
        message:
          result.status === "ok"
            ? `Converted to ${result.output}`
            : result.status === "skipped"
              ? String(result.message ?? result.reason ?? "Skipped")
              : String(result.error ?? "Conversion failed"),
        limitations:
          "Text-only bundled engine: no image extraction, OCR pass, Vale lint, or full paradocs.py rip pipeline.",
      });
    } catch (err) {
      return errorResult(err);
    }
  },
);

registerAppTool(
  server,
  "convert_folder",
  {
    title: "Convert a folder of Word/PDF files to Markdown",
    description:
      "Batch-convert .docx/.docm/.pdf under inputDir into outputDir preserving relative paths. Uses bundled profiles. Poll job_status for progress on large folders.",
    inputSchema: {
      inputDir: z.string().describe("Folder containing Word/PDF sources"),
      outputDir: z
        .string()
        .optional()
        .describe("Markdown output folder (default: inputDir/markdown or PARADOCS_DEFAULT_OUTPUT_DIR/<basename>)"),
      profile: z.string().optional().describe("Bundled ripping profile name"),
      overwrite: z.boolean().optional(),
      recursive: z.boolean().optional().describe("Include subfolders (default true)."),
    },
    _meta: APP_UI_META,
  },
  async ({ inputDir, outputDir, profile, overwrite, recursive }) => {
    try {
      const resolved = resolveFolderOutput(inputDir, outputDir);
      const job = createJob({
        kind: "folder",
        profile: profile ?? "default",
        inputDir: resolved.inputDir,
        outputDir: resolved.outputDir,
        message: "Queued folder conversion.",
      });
      const jobProgressFile = progressFileForJob(job.id);

      void runJob(
        job.id,
        () =>
          convertFolder({
            inputDir: resolved.inputDir,
            outputDir: resolved.outputDir,
            profile,
            overwrite,
            recursive,
            progressFile: jobProgressFile,
            onProgress: (payload) => {
              updateJob(job.id, {
                progress: {
                  index: payload.index as number | undefined,
                  total: payload.total as number | undefined,
                  counts: payload.counts as Record<string, number> | undefined,
                  last: payload.last as Record<string, unknown> | undefined,
                },
              });
            },
          }),
        (result) => ({
          result: result as Record<string, unknown>,
          message: `Finished batch: ok=${(result.counts as Record<string, number> | undefined)?.ok ?? 0}`,
        }),
      );

      return textResult({
        view: "convert_progress",
        status: "queued",
        jobId: job.id,
        profile: profile ?? "default",
        inputDir: resolved.inputDir,
        outputDir: resolved.outputDir,
        message: "Folder conversion started. Poll job_status for progress.",
      });
    } catch (err) {
      return errorResult(err);
    }
  },
);

registerAppTool(
  server,
  "job_status",
  {
    title: "Convert job status",
    description: "Return progress and results for convert_file / convert_folder background jobs.",
    inputSchema: {
      jobId: z.string().describe("Job id returned by convert_file (async) or convert_folder"),
    },
    _meta: APP_UI_META,
  },
  async ({ jobId }) => {
    try {
      const job = loadJob(jobId);
      return textResult(getJobStatusPayload(job));
    } catch (err) {
      return errorResult(err);
    }
  },
);

registerAppTool(
  server,
  "list_settings_profiles",
  {
    title: "List bundled ripping profiles",
    description:
      "List ParaDOCS ripping profiles shipped with the plugin (default, Main, …). These override YAML front matter and rip toggles for convert tools.",
    inputSchema: {},
    _meta: APP_UI_META,
  },
  async () => {
    try {
      const data = await listBundledProfiles();
      return textResult({
        view: "result",
        panelTitle: "Bundled ripping profiles",
        ...data,
      });
    } catch (err) {
      return errorResult(err);
    }
  },
);

registerAppTool(
  server,
  "get_settings_profile",
  {
    title: "Get bundled ripping profile",
    description: "Read a bundled ripping profile JSON (settings used by convert_file / convert_folder).",
    inputSchema: {
      profile: z
        .string()
        .optional()
        .describe('Profile name (default, Main, …). Omit for "default".'),
    },
    _meta: APP_UI_META,
  },
  async ({ profile }) => {
    try {
      const data = await getBundledProfile(profile);
      return textResult({
        view: "result",
        panelTitle: `Profile: ${data.name}`,
        ...data,
      });
    } catch (err) {
      return errorResult(err);
    }
  },
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
