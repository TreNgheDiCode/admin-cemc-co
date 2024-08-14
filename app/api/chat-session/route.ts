import { ChatSupportSchema } from "@/data/form-schema";
import { db } from "@/lib/db";
import { ChatSessionRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
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
        return { error: "Người dùng không tồn tại" };
      }

      const existChatSession = await db.chatSession.findFirst({
        where: {
          userId: data.userId,
        },
      });

      if (existChatSession) {
        if (data.clientId !== existChatSession.clientId) {
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
        if (!data.clientId) {
          return NextResponse.json(
            {
              error:
                "Không tìm thấy mã máy khách. Không thể lưu trữ phiên chat",
            },
            { status: 400 }
          );
        }
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
            clientId: data.clientId,
          },
        });

        return NextResponse.json(
          { success: "Tạo phiên chat thành công" },
          { status: 200 }
        );
      }
    }

    if (data.clientId) {
      const existChatSession = await db.chatSession.findFirst({
        where: {
          clientId: data.clientId,
        },
      });

      if (existChatSession) {
        if (!existChatSession.userId && data.userId) {
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
    }
  } catch (error) {
    console.log("ERROR CREATE CHAT SESSION", error);

    return NextResponse.json({ error: "Lỗi tạo phiên chat" }, { status: 500 });
  }
}
