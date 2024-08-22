"use server";

import {
  ChatSupportFormValues,
  ChatSupportSchema,
} from "@/data/schemas/form-schema";
import { db } from "@/lib/db";
import { ChatSessionRole } from "@prisma/client";
import { cookies } from "next/headers";

export const sendChatSupport = async (values: ChatSupportFormValues) => {
  try {
    const cookieStore = cookies();
    const clientId = cookieStore.get("ably_clientId");
    const validatedValues = ChatSupportSchema.safeParse(values);

    if (!validatedValues.success) {
      return { error: validatedValues.error.message };
    }

    const { message, ...data } = validatedValues.data;

    if (!message) return { error: "Tin nhắn không được để trống" };

    console.log(data);

    if (data.clientId && data.clientId !== clientId?.value) {
      const existChatSession = await db.chatSession.findFirst({
        where: {
          clientId: data.clientId,
        },
      });

      if (existChatSession) {
        await db.chatSession.update({
          where: {
            id: existChatSession.id,
          },
          data: {
            messages: {
              create: [
                {
                  role: ChatSessionRole.ADMIN,
                  message,
                },
              ],
            },
          },
        });

        return { success: true };
      } else {
        await db.chatSession.create({
          data: {
            ...data,
            clientId: data.clientId,
            messages: {
              create: [
                {
                  role: ChatSessionRole.ADMIN,
                  message,
                },
              ],
            },
          },
        });

        return { success: "Tạo phiên chat thành công" };
      }
    }
  } catch (error) {
    console.log("ERROR SEND CHAT SUPPORT", error);

    return { error: "Lỗi lưu trữ phiên chat" };
  }
};
