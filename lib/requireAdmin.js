import { verifyAdminToken, SESSION_COOKIE } from "@/lib/auth";

export async function requireAdmin(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifyAdminToken(token) : null;
  return session;
}
