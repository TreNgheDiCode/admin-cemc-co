import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    if (!params.userId) {
      return NextResponse.json(
        { error: "Không tìm thấy mã người dùng" },
        { status: 400 }
      );
    }

    const notifications = await db.notificationPush.findMany({
      where: {
        receiverId: params.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.log("Error getting notifications", error);

    return NextResponse.json(
      { error: "Error getting notifications" },
      { status: 500 }
    );
  }
}
