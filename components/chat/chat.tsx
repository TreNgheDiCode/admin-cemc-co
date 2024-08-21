"use client";

import * as Ably from "ably";
import { AblyProvider, ChannelProvider } from "ably/react";
import { ChatBox } from "./chat-box";
import { ChatSessionRole } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { Chats } from "./chats";
import { IconArrowLeft } from "@tabler/icons-react";
import { Button } from "../ui/button";
import AblyClient from "@/hooks/use-ably";

export class ChatSession {
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

export class ChatSessionMessage {
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

type Props = {
  clientId: string;
  chats: ChatSession[];
};

const Chat = ({ clientId, chats }: Props) => {
  const client = AblyClient.getInstance();

  const [senderClientId, setSenderClientId] = useState<string | null>(null);
  const [chatsState, setChats] = useState(chats);

  const channels = useMemo(() => {
    if (!chats || !client) return [];
    return chats.map((chat) => client.channels.get(`support:${chat.clientId}`));
  }, [chats, client]);

  useEffect(() => {
    if (!channels || channels.length === 0) return;

    const subscriptions = channels.map((channel) => {
      const handler = (message: Ably.Message) => {
        const updatedChats = chatsState.map((chat) => {
          const name = message.name!.split(":")[1];
          if (chat.clientId === name && message.clientId) {
            return {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  name:
                    chat.messages[0]?.role === ChatSessionRole.ADMIN
                      ? "Bạn"
                      : "Người dùng",
                  message: message.data,
                  role:
                    message.clientId === clientId
                      ? ChatSessionRole.ADMIN
                      : ChatSessionRole.USER,
                  createdAt: new Date(),
                  clientId: message.clientId,
                },
              ],
            };
          }
          return chat;
        });

        setChats(updatedChats);
      };

      channel.subscribe(handler);
      return { channel, handler };
    });

    return () => {
      subscriptions.forEach(({ channel, handler }) => {
        channel.unsubscribe(handler);
      });
    };
  }, [channels, clientId, chatsState]);

  if (!client) return null;

  return (
    <>
      {!senderClientId ? (
        <Chats chats={chatsState} setSenderClientId={setSenderClientId} />
      ) : (
        <AblyProvider client={client}>
          {channels.map((channel, index) => {
            if (channel.name !== `support:${senderClientId}`) return null;
            return (
              <ChannelProvider key={index} channelName={channel.name}>
                <div className="flex flex-col gap-2">
                  <Button
                    className="flex items-center gap-2"
                    onClick={() => setSenderClientId(null)}
                    variant="ghost"
                  >
                    <IconArrowLeft className="w-6 h-6 cursor-pointer" />
                    Quay về
                  </Button>
                  <ChatBox
                    senderClientId={senderClientId}
                    clientId={clientId}
                  />
                </div>
              </ChannelProvider>
            );
          })}
        </AblyProvider>
      )}
    </>
  );
};

export default Chat;
