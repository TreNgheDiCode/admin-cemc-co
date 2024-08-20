"use client";

import { ChatSessionRole } from "@prisma/client";
import { format } from "date-fns";
import { ChatSession } from "./chat";

type Props = {
  chats: ChatSession[];
  setSenderClientId: (id: string) => void;
};

export const Chats = ({ chats, setSenderClientId }: Props) => {
  return chats.map((chat, index) => {
    const clientIds = chat.clientId.split("-");
    const message = chat.messages[chat.messages.length - 1];
    return (
      <div
        key={index}
        onClick={() => setSenderClientId(chat.clientId)}
        className="hover:bg-main/30 rounded-md cursor-default flex flex-col gap-2 p-1"
      >
        <div className="flex items-center gap-2 justify-between">
          <div className="font-semibold text-sm">
            Người dùng {chat.name ?? "..." + clientIds[clientIds.length - 1]}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {format(new Date(chat.updatedAt), "dd/MM/yyyy HH:mm")}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {!chat || chat.messages.length === 0 ? (
              <div key={index} className="text-main dark:text-main-foreground">
                Tin nhắn hiện đang trống
              </div>
            ) : message!.role === ChatSessionRole.ADMIN ? (
              "Bạn" + ": " + message!.message
            ) : (
              "Người dùng " + chat.name + ": " + message!.message
            )}
          </div>
        </div>
      </div>
    );
  });
};
