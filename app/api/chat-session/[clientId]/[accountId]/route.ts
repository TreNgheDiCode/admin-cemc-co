import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { clientId: string; accountId: string } }
) {
  try {
    if (!params.clientId && !params.accountId) {
      return NextResponse.json(null, { status: 404 });
    }

    const chatSession = await db.chatSession.findFirst({
      where: {
        OR: [
          {
            clientId: params.clientId,
          },
          {
            userId: params.accountId,
          },
        ],
      },
      include: {
        messages: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!chatSession) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(chatSession);
  } catch (error) {
    console.log("ERROR GET /api/chat-session/:clientId", error);

    return NextResponse.json({ error: "Lỗi không xác định" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { clientId: string; accountId: string } }
) {
  try {
    if (!params.clientId && !params.accountId) {
      return NextResponse.json(null, { status: 404 });
    }

    const chatSession = await db.chatSession.findFirst({
      where: {
        OR: [
          {
            clientId: params.clientId,
          },
          {
            userId: params.accountId,
          },
        ],
      },
    });

    if (!chatSession) {
      return NextResponse.json(null, { status: 404 });
    }

    await db.chatSessionMessage.deleteMany({
      where: {
        chatSessionId: chatSession.id,
      },
    });

    return NextResponse.json(null, { status: 200 });
  } catch (error) {
    console.log("ERROR DELETE /api/chat-session/:clientId", error);

    return NextResponse.json({ error: "Lỗi không xác định" }, { status: 500 });
  }
}
