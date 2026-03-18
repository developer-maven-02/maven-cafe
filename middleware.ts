import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  console.log("PATH:", path);
  console.log("TOKEN:", token);

  if (!token) {
    console.log("No token found");
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const { payload } = await jwtVerify(token, secret);

    console.log("PAYLOAD:", payload);

    if (path.startsWith("/screens/admin") && payload.role !== "admin") {
      console.log("Admin access denied");
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (path.startsWith("/screens/staff") && payload.role !== "staff") {
      console.log("Staff access denied");
      return NextResponse.redirect(new URL("/", request.url));
    }

    console.log("Access granted");
    return NextResponse.next();
  } catch (error) {
    console.log("JWT ERROR:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/screens/:path*"],
};