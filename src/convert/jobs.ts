import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getRepoRoot } from "./paths.js";

export type JobStatus = "queued" | "running" | "completed" | "failed";

export type ConvertJob = {
  id: string;
  kind: "file" | "folder";
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  profile?: string;
  inputPath?: string;
  outputPath?: string;
  inputDir?: string;
  outputDir?: string;
  message?: string;
  progress?: {
    index?: number;
    total?: number;
    counts?: Record<string, number>;
    last?: Record<string, unknown>;
  };
  result?: Record<string, unknown>;
  error?: string;
};

const jobs = new Map<string, ConvertJob>();

function nowIso(): string {
  return new Date().toISOString();
}

function jobsDir(): string {
  return path.join(getRepoRoot(), ".paradocs-jobs");
}

function persistJob(job: ConvertJob): void {
  const dir = jobsDir();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${job.id}.json`), JSON.stringify(job, null, 2), "utf8");
}

export function createJob(partial: Omit<ConvertJob, "id" | "status" | "createdAt" | "updatedAt">): ConvertJob {
  const job: ConvertJob = {
    id: randomUUID(),
    status: "queued",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...partial,
  };
  jobs.set(job.id, job);
  persistJob(job);
  return job;
}

export function updateJob(id: string, patch: Partial<ConvertJob>): ConvertJob | undefined {
  const existing = jobs.get(id) ?? loadJob(id);
  if (!existing) {
    return undefined;
  }
  const next: ConvertJob = { ...existing, ...patch, updatedAt: nowIso() };
  jobs.set(id, next);
  persistJob(next);
  return next;
}

export function loadJob(id: string): ConvertJob | undefined {
  if (jobs.has(id)) {
    return jobs.get(id);
  }
  const file = path.join(jobsDir(), `${id}.json`);
  if (!fs.existsSync(file)) {
    return undefined;
  }
  try {
    const job = JSON.parse(fs.readFileSync(file, "utf8")) as ConvertJob;
    jobs.set(id, job);
    return job;
  } catch {
    return undefined;
  }
}

export function getJobStatusPayload(job?: ConvertJob): Record<string, unknown> {
  if (!job) {
    return {
      view: "job_status",
      status: "idle",
      jobId: null,
      message: "No convert job found. Start one with convert_file or convert_folder.",
    };
  }

  const progress = job.progress;
  const counts = progress?.counts ?? (job.result?.counts as Record<string, number> | undefined);
  const total = progress?.total ?? (typeof job.result?.total === "number" ? job.result.total : undefined);
  const index = progress?.index;

  let message = job.message;
  if (job.status === "running" && total && index) {
    message = `Converting ${index}/${total} files…`;
  } else if (job.status === "completed") {
    message = job.message ?? "Conversion finished.";
  } else if (job.status === "failed") {
    message = job.error ?? job.message ?? "Conversion failed.";
  }

  return {
    view: "job_status",
    status: job.status,
    jobId: job.id,
    kind: job.kind,
    profile: job.profile,
    inputPath: job.inputPath,
    outputPath: job.outputPath,
    inputDir: job.inputDir,
    outputDir: job.outputDir,
    message,
    progress: progress
      ? {
          index: progress.index,
          total: progress.total,
          counts: progress.counts,
          lastSource: (progress.last as Record<string, unknown> | undefined)?.source,
          lastStatus: (progress.last as Record<string, unknown> | undefined)?.status,
        }
      : undefined,
    counts,
    result: job.result,
    updatedAt: job.updatedAt,
  };
}

export function progressFileForJob(jobId: string): string {
  return path.join(os.tmpdir(), `paradocs-convert-${jobId}.json`);
}

export async function runJob<T>(
  jobId: string,
  runner: () => Promise<T>,
  onSuccess: (result: T) => Partial<ConvertJob>,
): Promise<void> {
  updateJob(jobId, { status: "running", message: "Starting conversion…" });
  try {
    const result = await runner();
    updateJob(jobId, { status: "completed", ...onSuccess(result), message: "Conversion finished." });
  } catch (err) {
    updateJob(jobId, {
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
      message: "Conversion failed.",
    });
  }
}
