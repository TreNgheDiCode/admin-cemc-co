"use server";

import { db } from "@/lib/db";
import { ChatSessionRole } from "@prisma/client";

class ChatSession {
  id: string;
  clientId: string;
  name: string;
  updatedAt: Date;
  messages: ChatSessionMessage[];

  constructor(
    id: string,
    clientId: string,
    name: string,
    updatedAt: Date,
    messages: ChatSessionMessage[]
  ) {
    this.id = id;
    this.clientId = clientId;
    this.name = name;
    this.updatedAt = updatedAt;
    this.messages = messages;
  }
}

class ChatSessionMessage {
  name: string;
  message: string;
  role: ChatSessionRole;
  createdAt: Date;
  clientId: string;

  constructor(
    name: string,
    message: string,
    role: ChatSessionRole,
    createdAt: Date,
    clientId: string
  ) {
    this.name = name;
    this.message = message;
    this.role = role;
    this.createdAt = createdAt;
    this.clientId = clientId;
  }
}

export const getChatSessions = async () => {
  const chatSessions = await db.chatSession.findMany({
    select: {
      id: true,
      clientId: true,
      name: true,
      updatedAt: true,
      messages: {
        select: {
          role: true,
          message: true,
          createdAt: true,
        },
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return chatSessions.map((chatSession) => {
    return new ChatSession(
      chatSession.id,
      chatSession.clientId,
      chatSession.name ?? "..." + chatSession.clientId.slice(-5),
      chatSession.updatedAt,
      chatSession.messages.map((message) => {
        return new ChatSessionMessage(
          message.role === ChatSessionRole.ADMIN ? "Bạn" : "Người dùng",
          message.message,
          message.role,
          message.createdAt,
          chatSession.clientId
        );
      })
    );
  });
};

export const getChatSessionMessages = async (
  clientId: string,
  senderClientId: string
) => {
  const chatSession = await db.chatSession.findFirst({
    where: {
      clientId: senderClientId,
    },
    select: {
      clientId: true,
      name: true,
      messages: {
        select: {
          role: true,
          message: true,
          createdAt: true,
        },
      },
    },
  });

  if (!chatSession) {
    return [];
  }

  return chatSession.messages.map((message) => {
    return {
      name:
        message.role === ChatSessionRole.ADMIN
          ? "Bạn"
          : chatSession.name ?? "Người dùng",
      message: message.message,
      role: message.role,
      createdAt: message.createdAt,
      clientId:
        message.role === ChatSessionRole.ADMIN ? clientId : senderClientId,
    };
  });
};
