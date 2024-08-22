import { ChatSupportSchema } from "@/data/schemas/form-schema";
import { v4 as uuid } from "uuid";
import { db } from "@/lib/db";
import { ChatSessionMessage, ChatSessionRole } from "@prisma/client";
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

    // Check if user is logged in
    if (data.userId) {
      console.log("USER ID", data.userId);
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
              ...data,
              clientId: data.clientId,
            },
          });
        } else if (
          (data.email && data.email !== existChatSession.email) ||
          (data.phone && data.phone !== existChatSession.phone)
        ) {
          await db.chatSession.update({
            where: {
              id: existChatSession.id,
            },
            data: {
              ...data,
              email: data.email,
              phone: data.phone,
            },
          });
        }

        let messages: ChatSessionMessage[] = [];
        const existClients = await db.chatSession.findMany({
          where: {
            clientId: data.clientId,
          },
          include: {
            messages: true,
          },
        });

        if (existClients.length > 1) {
          existClients.forEach((client) => {
            messages = [...messages, ...client.messages];
          });

          const clientNeedToDelete = existClients.find(
            (client) => client.id !== existChatSession.id
          );

          await db.chatSessionMessage.deleteMany({
            where: {
              chatSessionId: clientNeedToDelete!.id,
            },
          });

          await db.chatSessionMessage.deleteMany({
            where: {
              chatSessionId: existChatSession.id,
            },
          });

          await db.chatSession.delete({
            where: {
              id: clientNeedToDelete!.id,
            },
          });
        }

        if (messages.length === 0) {
          await db.chatSessionMessage.create({
            data: {
              message,
              role: ChatSessionRole.USER,
              chatSessionId: existChatSession.id,
            },
          });
        } else {
          messages.sort((a, b) => {
            return a.createdAt.getTime() - b.createdAt.getTime();
          });

          const messagesToCreaet = messages.map((msg) => {
            return {
              message: msg.message,
              role: msg.role,
              chatSessionId: existChatSession.id,
            };
          });

          await db.chatSessionMessage.createMany({
            data: messagesToCreaet,
          });

          await db.chatSessionMessage.create({
            data: {
              message,
              role: ChatSessionRole.USER,
              chatSessionId: existChatSession.id,
            },
          });
        }

        return NextResponse.json({ success: true }, { status: 200 });
      } else {
        const existClient = await db.chatSession.findFirst({
          where: {
            clientId: data.clientId,
          },
        });

        if (existClient) {
          await db.chatSession.update({
            where: {
              id: existClient.id,
            },
            data: {
              ...data,
              userId: data.userId,
            },
          });

          await db.chatSessionMessage.create({
            data: {
              message,
              role: ChatSessionRole.USER,
              chatSessionId: existClient.id,
            },
          });

          return NextResponse.json({ success: true }, { status: 200 });
        }

        console.log("EXIST USER", user.id);

        await db.chatSession.create({
          data: {
            ...data,
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

    if (data.clientId) {
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
              ...data,
              userId: data.userId,
            },
          });
        } else {
          await db.chatSession.update({
            where: {
              id: existChatSession.id,
            },
            data: {
              ...data,
              userId: undefined,
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
        const existUser = await db.account.findUnique({
          where: {
            id: data.userId,
          },
        });

        console.log("EXIST USER", existUser?.id);

        await db.chatSession.create({
          data: {
            userId: existUser?.id,
            email: data.email,
            phone: data.phone,
            name: data.name,
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
