import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export async function GET(
  req: Request,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  const params = await context.params;
  return handler(req, { params });
}

export async function POST(
  req: Request,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  const params = await context.params;
  return handler(req, { params });
}
