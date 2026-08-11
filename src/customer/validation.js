import { ApiError } from "../http.js";

export function text(value, field, max = 240, required = false) {
  const result = typeof value === "string" ? value.trim() : "";
  if (required && !result) throw new ApiError(400, `${field} is required.`);
  if (result.length > max) throw new ApiError(400, `${field} is too long.`);
  return result;
}

export function email(value, required = false) {
  const result = text(value, "Email", 254, required).toLowerCase();
  if (result && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new ApiError(400, "Enter a valid email address.");
  return result;
}

export function slug(value) {
  const result = text(value, "Slug", 60, true).toLocaleLowerCase("tr")
    .replaceAll("ı", "i").replaceAll("ğ", "g").replaceAll("ü", "u")
    .replaceAll("ş", "s").replaceAll("ö", "o").replaceAll("ç", "c")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (result.length < 3) throw new ApiError(400, "Slug must contain at least 3 characters.");
  return result.slice(0, 48);
}

export function id(value) {
  const result = String(value || "");
  if (!/^[a-f0-9-]{20,50}$/i.test(result)) throw new ApiError(400, "Invalid record ID.");
  return result;
}

export function number(value, field, { min = 0, max = 10_000_000, integer = false } = {}) {
  const result = Number(value);
  if (!Number.isFinite(result) || result < min || result > max || (integer && !Number.isInteger(result))) {
    throw new ApiError(400, `Enter a valid ${field}.`);
  }
  return result;
}

export function bool(value) {
  return value === true || value === 1 || value === "1" ? 1 : 0;
}

export function color(value, fallback) {
  const result = text(value, "Color", 7);
  return /^#[0-9a-f]{6}$/i.test(result) ? result.toLowerCase() : fallback;
}

export function safeUrl(value, field = "URL") {
  const result = text(value, field, 1000);
  if (!result) return "";
  try {
    const parsed = new URL(result, "https://auradigital.ink");
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("protocol");
    return result.startsWith("/") ? result : parsed.toString();
  } catch {
    throw new ApiError(400, `Enter a valid ${field}.`);
  }
}

export function password(value) {
  const result = typeof value === "string" ? value : "";
  if (result.length < 12 || result.length > 128) throw new ApiError(400, "Password must be 12–128 characters.");
  if (!/[A-Za-z]/.test(result) || !/\d/.test(result)) throw new ApiError(400, "Password must include a letter and a number.");
  return result;
}
