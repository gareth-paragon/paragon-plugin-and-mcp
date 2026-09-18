import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  getConvertCliPath,
  getDefaultOutputDir,
  getEngineDir,
  getProfilesDir,
  getVenvDir,
  getVenvPython,
} from "./paths.js";

export type EngineResult = Record<string, unknown>;

export type RunEngineOptions = {
  args: string[];
  progressFile?: string;
  onProgress?: (payload: Record<string, unknown>) => void;
};

let venvReady: Promise<void> | null = null;

function resolveSystemPython(): string {
  const candidates = ["python3", "python"];
  for (const bin of candidates) {
    const probe = spawnSync(bin, ["--version"], { encoding: "utf8" });
    if (probe.status === 0) {
      return bin;
    }
  }
  throw new Error(
    "Python 3 is required for ParaDOCS convert. Install Python 3.10+ or set PARADOCS_VENV_DIR to an existing venv.",
  );
}

async function ensureVenv(): Promise<string> {
  const python = getVenvPython();
  if (fs.existsSync(python)) {
    return python;
  }

  if (!venvReady) {
    venvReady = (async () => {
      const systemPython = resolveSystemPython();
      const venvDir = getVenvDir();
      fs.mkdirSync(path.dirname(venvDir), { recursive: true });
      const create = spawnSync(systemPython, ["-m", "venv", venvDir], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      if (create.status !== 0) {
        throw new Error(
          `Failed to create ParaDOCS venv at ${venvDir}: ${create.stderr || create.stdout}`,
        );
      }
      const pip = getVenvPython();
      const req = path.join(getEngineDir(), "requirements.txt");
      const install = spawnSync(
        pip,
        ["-m", "pip", "install", "--disable-pip-version-check", "-q", "-r", req],
        { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
      );
      if (install.status !== 0) {
        throw new Error(
          `Failed to install ParaDOCS engine dependencies: ${install.stderr || install.stdout}`,
        );
      }
    })();
  }
  await venvReady;
  return getVenvPython();
}

function parseJsonLine(stdout: string): EngineResult {
  const trimmed = stdout.trim();
  if (!trimmed) {
    throw new Error("Convert engine returned no output.");
  }
  const line = trimmed.split("\n").filter(Boolean).at(-1) ?? trimmed;
  return JSON.parse(line) as EngineResult;
}

export async function runEngine(options: RunEngineOptions): Promise<EngineResult> {
  const python = await ensureVenv();
  const cli = getConvertCliPath();
  if (!fs.existsSync(cli)) {
    throw new Error(`Bundled convert CLI missing at ${cli}.`);
  }

  const args = [cli, "--profiles-dir", getProfilesDir(), ...options.args];
  const { spawn } = await import("node:child_process");

  return await new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    let progressTimer: NodeJS.Timeout | undefined;

    const child = spawn(python, args, {
      cwd: getEngineDir(),
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });

    if (options.progressFile && options.onProgress) {
      progressTimer = setInterval(() => {
        try {
          if (fs.existsSync(options.progressFile!)) {
            const raw = fs.readFileSync(options.progressFile!, "utf8");
            options.onProgress!(JSON.parse(raw) as Record<string, unknown>);
          }
        } catch {
          // ignore transient read/parse errors while job runs
        }
      }, 500);
    }

    child.on("error", (err) => {
      if (progressTimer) {
        clearInterval(progressTimer);
      }
      reject(err);
    });

    child.on("close", (code) => {
      if (progressTimer) {
        clearInterval(progressTimer);
      }
      try {
        const payload = parseJsonLine(stdout);
        if (code !== 0 && payload.status !== "completed" && payload.status !== "ok") {
          payload.exitCode = code ?? 1;
          if (stderr.trim()) {
            payload.engineStderr = stderr.trim().slice(-2000);
          }
        }
        resolve(payload);
      } catch (err) {
        reject(
          new Error(
            `Convert engine failed (exit ${code ?? "?"}): ${stderr.trim() || stdout.trim() || String(err)}`,
          ),
        );
      }
    });
  });
}

export function resolveOutputPath(
  inputPath: string,
  outputPath?: string,
): { input: string; output: string } {
  const input = path.resolve(inputPath);
  if (outputPath?.trim()) {
    return { input, output: path.resolve(outputPath) };
  }
  const defaultDir = getDefaultOutputDir();
  if (defaultDir) {
    return { input, output: path.join(defaultDir, `${path.basename(input, path.extname(input))}.md`) };
  }
  return { input, output: input.replace(/\.[^.]+$/, ".md") };
}

export function resolveFolderOutput(inputDir: string, outputDir?: string): { inputDir: string; outputDir: string } {
  const input = path.resolve(inputDir);
  if (outputDir?.trim()) {
    return { inputDir: input, outputDir: path.resolve(outputDir) };
  }
  const defaultDir = getDefaultOutputDir();
  if (defaultDir) {
    return { inputDir: input, outputDir: path.join(defaultDir, path.basename(input)) };
  }
  return { inputDir: input, outputDir: path.join(input, "markdown") };
}

export async function convertFile(args: {
  inputPath: string;
  outputPath?: string;
  profile?: string;
  overwrite?: boolean;
}): Promise<EngineResult> {
  const { input, output } = resolveOutputPath(args.inputPath, args.outputPath);
  return runEngine({
    args: [
      "convert-file",
      "--input",
      input,
      "--output",
      output,
      "--profile",
      args.profile?.trim() || "default",
      ...(args.overwrite ? ["--overwrite"] : []),
    ],
  });
}

export async function convertFolder(args: {
  inputDir: string;
  outputDir?: string;
  profile?: string;
  overwrite?: boolean;
  recursive?: boolean;
  progressFile?: string;
  onProgress?: (payload: Record<string, unknown>) => void;
}): Promise<EngineResult> {
  const { inputDir, outputDir } = resolveFolderOutput(args.inputDir, args.outputDir);
  return runEngine({
    args: [
      "convert-folder",
      "--input-dir",
      inputDir,
      "--output-dir",
      outputDir,
      "--profile",
      args.profile?.trim() || "default",
      ...(args.overwrite ? ["--overwrite"] : []),
      ...(args.recursive === false ? ["--no-recursive"] : []),
      ...(args.progressFile ? ["--progress-file", args.progressFile] : []),
    ],
    progressFile: args.progressFile,
    onProgress: args.onProgress,
  });
}

export async function listProfilesEngine(): Promise<EngineResult> {
  return runEngine({ args: ["list-profiles"] });
}

export async function getProfileEngine(profile?: string): Promise<EngineResult> {
  return runEngine({
    args: ["get-profile", "--profile", profile?.trim() || "default"],
  });
}
