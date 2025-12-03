import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    const existingToken = await db.passwordResetToken.findUnique({
      where: { token }
    });

    if (!existingToken) {
      return new NextResponse("Invalid token", { status: 400 });
    }

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
      return new NextResponse("Token expired", { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email: existingToken.email }
    });

    if (!existingUser) {
      return new NextResponse("User does not exist", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.user.update({
      where: { id: existingUser.id },
      data: { password: hashedPassword }
    });

    await db.passwordResetToken.delete({
      where: { id: existingToken.id }
    });

    return new NextResponse("Password updated", { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}