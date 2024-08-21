import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { accountId: string } }
) {
  try {
    if (!params.accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    const existingAccount = await db.account.findUnique({
      where: {
        id: params.accountId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        student: {
          select: {
            studentCode: true,
            status: true,
          },
        },
      },
      cacheStrategy: {
        swr: 300,
        ttl: 3600,
      },
    });

    if (!existingAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json(existingAccount, { status: 200 });
  } catch (error) {
    console.log("GET ACCOUNT BY ID ERROR", error);

    return NextResponse.json(
      { error: "Error fetching account by id" },
      { status: 500 }
    );
  }
}
