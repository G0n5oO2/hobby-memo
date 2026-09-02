import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./db.js";

const COOKIE_NAME = "hobby_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30日

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export async function createSession(userId) {
  const session = await prisma.session.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });
  return session.id;
}

export function setSessionCookie(res, sessionId) {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`
  );
}

export function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  return Object.fromEntries(
    header.split(";").map((part) => {
      const [key, ...rest] = part.trim().split("=");
      return [key, decodeURIComponent(rest.join("="))];
    })
  );
}

export async function getSessionUser(req) {
  const cookies = parseCookies(req);
  const sessionId = cookies[COOKIE_NAME];
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}

export async function requireUser(req, res) {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "ログインが必要です。" });
    return null;
  }
  return user;
}

export async function destroySession(req) {
  const cookies = parseCookies(req);
  const sessionId = cookies[COOKIE_NAME];
  if (!sessionId) return;
  await prisma.session.deleteMany({ where: { id: sessionId } });
}
