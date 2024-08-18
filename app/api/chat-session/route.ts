import { ChatSupportSchema } from "@/data/form-schema";
import { v4 as uuid } from "uuid";
import { db } from "@/lib/db";
import { ChatSessionRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return NextResponse.json(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const body = await req.json();

    const validatedValues = ChatSupportSchema.safeParse(body);

    if (!validatedValues.success) {
      return NextResponse.json(
        { error: validatedValues.error.message },
        { status: 400 }
      );
    }

    const { message, ...data } = validatedValues.data;

    if (data.userId) {
      const user = await db.account.findUnique({
        where: {
          id: data.userId,
        },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Người dùng không tồn tại" },
          { status: 400 }
        );
      }

      const existChatSession = await db.chatSession.findFirst({
        where: {
          userId: data.userId,
        },
      });

      if (existChatSession) {
        if (data.clientId && data.clientId !== existChatSession.clientId) {
          await db.chatSession.update({
            where: {
              id: existChatSession.id,
            },
            data: {
              clientId: data.clientId,
            },
          });
        }

        await db.chatSessionMessage.create({
          data: {
            message,
            role: ChatSessionRole.USER,
            chatSessionId: existChatSession.id,
          },
        });

        return NextResponse.json({ success: true }, { status: 200 });
      } else {
        await db.chatSession.create({
          data: {
            messages: {
              create: [
                {
                  message,
                  role: ChatSessionRole.USER,
                },
              ],
            },
            userId: data.userId,
            clientId: uuid(),
          },
        });

        return NextResponse.json(
          { success: "Tạo phiên chat thành công" },
          { status: 200 }
        );
      }
    }

    if (data.clientId && !data.userId) {
      const existChatSession = await db.chatSession.findFirst({
        where: {
          clientId: data.clientId,
        },
      });

      if (existChatSession) {
        if (data.userId && data.userId !== existChatSession.userId) {
          const existUser = await db.account.findUnique({
            where: {
              id: data.userId,
            },
          });

          if (!existUser) {
            return NextResponse.json(
              { error: "Người dùng không tồn tại" },
              { status: 400 }
            );
          }

          await db.chatSession.update({
            where: {
              id: existChatSession.id,
            },
            data: {
              userId: data.userId,
            },
          });
        }

        await db.chatSessionMessage.create({
          data: {
            message,
            role: ChatSessionRole.USER,
            chatSessionId: existChatSession.id,
          },
        });

        return NextResponse.json({ success: true }, { status: 200 });
      } else {
        await db.chatSession.create({
          data: {
            ...data,
            clientId: data.clientId,
            messages: {
              create: [
                {
                  message,
                  role: ChatSessionRole.USER,
                },
              ],
            },
          },
        });

        return NextResponse.json(
          { success: "Tạo phiên chat thành công" },
          { status: 200 }
        );
      }
    } else {
      return NextResponse.json(
        {
          error: "Không thể lưu trữ phiên chat do không tìm thấy mã máy khách",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log("ERROR CREATE CHAT SESSION", error);

    return NextResponse.json({ error: "Lỗi tạo phiên chat" }, { status: 500 });
  }
}
