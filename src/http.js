export class ApiError extends Error {
  constructor(status, message, headers = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.headers = headers;
  }
}

export async function readJson(request, maxBytes) {
  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new ApiError(413, "Request body is too large.");
  }
  if (!request.body) return {};

  const mediaType = (request.headers.get("Content-Type") || "")
    .split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (mediaType !== "application/json" && !mediaType.endsWith("+json")) {
    throw new ApiError(415, "Content-Type must be application/json.");
  }

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel("Request body limit exceeded");
        throw new ApiError(413, "Request body is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const text = new TextDecoder().decode(bytes);
  if (!text.trim()) return {};
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("JSON object required");
    }
    return data;
  } catch {
    throw new ApiError(400, "Invalid JSON request body.");
  }
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
      ...headers,
    },
  });
}
