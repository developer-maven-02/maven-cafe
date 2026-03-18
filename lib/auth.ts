import { jwtVerify } from "jose";

export async function verifyToken(req: Request) {
  const cookie = req.headers.get("cookie");

  const token = cookie
    ?.split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    throw new Error("No token found");
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const { payload } = await jwtVerify(token, secret);

  return {
    userId: payload.userId as string,
    role: payload.role as string,
  };
}