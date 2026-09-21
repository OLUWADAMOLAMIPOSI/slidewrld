const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
export const SESSION_COOKIE = "slidewrld_admin_session";
const SESSION_LENGTH_MS = 7 * 24 * 60 * 60 * 1000;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createAdminToken(email) {
  const payload = { email, role: "admin", exp: Date.now() + SESSION_LENGTH_MS };
  const payloadPart = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const key = await getSigningKey();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadPart));
  const signaturePart = toBase64Url(new Uint8Array(signatureBuffer));
  return `${payloadPart}.${signaturePart}`;
}

export async function verifyAdminToken(token) {
  if (!token || !token.includes(".")) return null;
  const [payloadPart, signaturePart] = token.split(".");
  try {
    const key = await getSigningKey();
    const expectedBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadPart));
    const expectedSignature = toBase64Url(new Uint8Array(expectedBuffer));
    if (expectedSignature !== signaturePart) return null;

    const payload = JSON.parse(decoder.decode(fromBase64Url(payloadPart)));
    if (payload.role !== "admin") return null;
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
