#!/usr/bin/env node

import { execFile } from "node:child_process";
import { cp, copyFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(repositoryRoot, "dist");
const bundleName = "engineering-reliable-coding-agents-skills-0.1.0";
const stagingRoot = path.join(outputRoot, bundleName);
const outputPath = path.join(outputRoot, `${bundleName}.zip`);

await mkdir(outputRoot, { recursive: true });
await rm(stagingRoot, { recursive: true, force: true });
await rm(outputPath, { force: true });
await mkdir(stagingRoot, { recursive: true });
await cp(path.join(repositoryRoot, "skills"), path.join(stagingRoot, "skills"), { recursive: true });
await copyFile(path.join(repositoryRoot, "LICENSE"), path.join(stagingRoot, "LICENSE"));
await copyFile(path.join(repositoryRoot, "LICENSE-SCOPE.md"), path.join(stagingRoot, "LICENSE-SCOPE.md"));
await run("zip", ["-X", "-q", "-r", outputPath, bundleName], { cwd: outputRoot });
await rm(stagingRoot, { recursive: true, force: true });
console.log(outputPath);
