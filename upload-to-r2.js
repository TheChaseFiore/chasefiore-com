#!/usr/bin/env node
// Usage: node upload-to-r2.js <local-file-path> [r2-key]
// Example: node upload-to-r2.js ./public/models/scene.glb models/scene.glb
//
// Required env vars (set in .env or export before running):
//   WORKER_URL  — e.g. https://r2-upload-worker.<your-subdomain>.workers.dev
//   AUTH_SECRET — the secret you set with: wrangler secret put AUTH_SECRET

import fs from "fs";
import path from "path";
import { createReadStream } from "fs";

const CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB per part (R2 minimum is 5 MB)

const WORKER_URL = process.env.WORKER_URL?.replace(/\/$/, "");
const AUTH_SECRET = process.env.AUTH_SECRET;

if (!WORKER_URL || !AUTH_SECRET) {
  console.error("Set WORKER_URL and AUTH_SECRET environment variables.");
  process.exit(1);
}

const [, , localFile, r2KeyArg] = process.argv;
if (!localFile) {
  console.error("Usage: node upload-to-r2.js <local-file> [r2-key]");
  process.exit(1);
}

const filePath = path.resolve(localFile);
const r2Key = r2KeyArg ?? path.basename(filePath);
const fileSize = fs.statSync(filePath).size;
const totalParts = Math.ceil(fileSize / CHUNK_SIZE);

const headers = { Authorization: `Bearer ${AUTH_SECRET}` };

async function apiPost(pathname, params, body) {
  const url = new URL(pathname, WORKER_URL);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, {
    method: "POST",
    headers: body instanceof Uint8Array
      ? { ...headers, "Content-Type": "application/octet-stream" }
      : { ...headers, "Content-Type": "application/json" },
    body: body instanceof Uint8Array ? body : JSON.stringify(body),
  });
  return res.json();
}

async function apiPut(pathname, params, chunk) {
  const url = new URL(pathname, WORKER_URL);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/octet-stream" },
    body: chunk,
  });
  return res.json();
}

async function readChunk(fd, start, size) {
  const buf = Buffer.alloc(Math.min(size, fileSize - start));
  fs.readSync(fd, buf, 0, buf.length, start);
  return buf;
}

async function upload() {
  console.log(`Uploading: ${filePath}`);
  console.log(`  → R2 key:    ${r2Key}`);
  console.log(`  → Size:      ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  → Parts:     ${totalParts} × ${CHUNK_SIZE / 1024 / 1024} MB`);

  // 1. Initiate
  const { uploadId } = await apiPost("/upload/init", { key: r2Key }, new Uint8Array(0));
  if (!uploadId) {
    console.error("Failed to initiate upload.");
    process.exit(1);
  }
  console.log(`\nUpload ID: ${uploadId}`);

  // 2. Upload parts
  const completedParts = [];
  const fd = fs.openSync(filePath, "r");

  try {
    for (let i = 0; i < totalParts; i++) {
      const partNumber = i + 1;
      const start = i * CHUNK_SIZE;
      const chunk = await readChunk(fd, start, CHUNK_SIZE);

      process.stdout.write(`  Part ${partNumber}/${totalParts}... `);
      const result = await apiPut("/upload/part", { key: r2Key, uploadId, partNumber: String(partNumber) }, chunk);

      if (!result.etag) {
        console.error(`\nPart ${partNumber} failed:`, result);
        await apiPost("/upload/abort", { key: r2Key, uploadId }, new Uint8Array(0));
        process.exit(1);
      }

      completedParts.push({ partNumber: result.partNumber, etag: result.etag });
      console.log(`done (etag: ${result.etag.slice(0, 8)}...)`);
    }
  } finally {
    fs.closeSync(fd);
  }

  // 3. Complete
  process.stdout.write("\nFinalizing... ");
  const final = await apiPost("/upload/complete", { key: r2Key, uploadId }, completedParts);
  if (!final.key) {
    console.error("Failed to complete upload:", final);
    process.exit(1);
  }

  console.log(`done!\n\nUploaded to R2: ${final.key}  (etag: ${final.etag})`);
}

upload().catch((err) => {
  console.error("Upload error:", err);
  process.exit(1);
});
