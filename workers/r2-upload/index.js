const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function cors(body, status = 200, extra = {}) {
  return new Response(body, { status, headers: { ...CORS, ...extra } });
}

function json(data, status = 200) {
  return cors(JSON.stringify(data), status, { "Content-Type": "application/json" });
}

function unauthorized() {
  return json({ error: "Unauthorized" }, 401);
}

function auth(request, env) {
  const header = request.headers.get("Authorization") ?? "";
  return header === `Bearer ${env.AUTH_SECRET}`;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return cors(null, 204);
    if (!auth(request, env)) return unauthorized();

    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    // POST /upload/init?key=path/to/file.glb
    // Initiates a multipart upload, returns { uploadId, key }
    if (request.method === "POST" && pathname === "/upload/init") {
      const key = searchParams.get("key");
      if (!key) return json({ error: "Missing key param" }, 400);

      const upload = await env.BUCKET.createMultipartUpload(key, {
        httpMetadata: { contentType: request.headers.get("Content-Type") ?? "application/octet-stream" },
      });
      return json({ uploadId: upload.uploadId, key });
    }

    // PUT /upload/part?key=...&uploadId=...&partNumber=1
    // Uploads one chunk, returns { etag, partNumber }
    if (request.method === "PUT" && pathname === "/upload/part") {
      const key = searchParams.get("key");
      const uploadId = searchParams.get("uploadId");
      const partNumber = Number(searchParams.get("partNumber"));

      if (!key || !uploadId || !partNumber) return json({ error: "Missing params" }, 400);

      const upload = env.BUCKET.resumeMultipartUpload(key, uploadId);
      const part = await upload.uploadPart(partNumber, request.body);
      return json({ etag: part.etag, partNumber });
    }

    // POST /upload/complete?key=...&uploadId=...
    // Body: JSON array of { partNumber, etag } objects
    // Assembles all parts into the final object
    if (request.method === "POST" && pathname === "/upload/complete") {
      const key = searchParams.get("key");
      const uploadId = searchParams.get("uploadId");
      if (!key || !uploadId) return json({ error: "Missing params" }, 400);

      const parts = await request.json();
      const upload = env.BUCKET.resumeMultipartUpload(key, uploadId);
      const result = await upload.complete(parts);
      return json({ key: result.key, etag: result.etag });
    }

    // DELETE /upload/abort?key=...&uploadId=...
    if (request.method === "DELETE" && pathname === "/upload/abort") {
      const key = searchParams.get("key");
      const uploadId = searchParams.get("uploadId");
      if (!key || !uploadId) return json({ error: "Missing params" }, 400);

      const upload = env.BUCKET.resumeMultipartUpload(key, uploadId);
      await upload.abort();
      return json({ aborted: true });
    }

    // GET /file?key=...  — serve a stored object (optional, for verifying uploads)
    if (request.method === "GET" && pathname === "/file") {
      const key = searchParams.get("key");
      if (!key) return json({ error: "Missing key param" }, 400);

      const object = await env.BUCKET.get(key);
      if (!object) return json({ error: "Not found" }, 404);

      const headers = new Headers({ ...CORS });
      object.writeHttpMetadata(headers);
      return new Response(object.body, { headers });
    }

    return json({ error: "Not found" }, 404);
  },
};
