"use client";

import * as Ably from "ably";
import { AblyProvider, ChannelProvider } from "ably/react";
import { ChatBox } from "./chat-box";
import { ChatSessionRole } from "@prisma/client";
import { useEffect, useState } from "react";
import { Chats } from "./chats";
import { IconArrowLeft } from "@tabler/icons-react";
import { Button } from "../ui/button";

export class ChatSessionMessage {
  name: string;
  message: string;
  role: ChatSessionRole;
  createdAt: Date;

  constructor(
    name: string,
    message: string,
    role: ChatSessionRole,
    createdAt: Date
  ) {
    this.name = name;
    this.message = message;
    this.role = role;
    this.createdAt = createdAt;
  }
}

type Props = {
  clientId: string;
  chats: {
    name: string | null;
    clientId: string;
    updatedAt: Date;
    messages: {
      role: ChatSessionRole;
      message: string;
    }[];
  }[];
};

const Chat = ({ clientId, chats }: Props) => {
  const client = new Ably.Realtime({
    authUrl: "/api/ably",
    authMethod: "POST",
  });
  const [messages, setMessages] = useState<ChatSessionMessage[]>([]);
  const [senderClientId, setSenderClientId] = useState<string | null>(null);

  const channels: Ably.RealtimeChannel[] = chats.map((chat) => {
    const channel = client.channels.get(`support:${chat.clientId}`);

    return channel;
  });

  return (
    <>
      {!senderClientId ? (
        <Chats chats={chats} setSenderClientId={setSenderClientId} />
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
                  <ChatBox clientId={clientId} channel={channel} />
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
