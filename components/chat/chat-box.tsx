"use client";

import { sendChatSupport } from "@/action/chat-support";
import { getChatSessionMessages } from "@/data/chat-support";
import {
  ChatSupportFormValues,
  ChatSupportSchema,
} from "@/data/schemas/form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChatSessionRole } from "@prisma/client";
import {
  IconArrowElbowLeft,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react";
import * as Ably from "ably";
import { format } from "date-fns";
import Image from "next/image";
import { KeyboardEventHandler, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Textarea } from "../ui/textarea";
import { ChatSessionMessage } from "./chat";
import { useChannel } from "ably/react";

type Props = {
  clientId: string;
  senderClientId: string;
};

export const ChatBox = ({ clientId, senderClientId }: Props) => {
  const [messages, setMessages] = useState<ChatSessionMessage[]>([]);
  const [isSoundOn, setIsSoundOn] = useState(true);

  const { channel } = useChannel(
    `support:${senderClientId}`,
    (message: Ably.Message) => {
      const history = messages.slice(-50);

      const messageExists = history.some(
        (m) =>
          m.message === message.data &&
          new Date(m.createdAt).getTime() ===
            new Date(message.timestamp!).getTime()
      );

      if (!messageExists) {
        setMessages([
          ...history,
          new ChatSessionMessage(
            message.clientId === clientId
              ? "Bạn"
              : messages.filter((m) => senderClientId === m.clientId)[0]
                  ?.name ?? "Người dùng",
            message.data,
            message.clientId === clientId
              ? ChatSessionRole.ADMIN
              : ChatSessionRole.USER,
            new Date(message.timestamp!),
            message.clientId === clientId ? clientId : senderClientId
          ),
        ]);
      }
    }
  );

  let messageEnd = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sendChatMessage = (messageText: string) => {
    channel.publish({ name: `support:${senderClientId}`, data: messageText });
  };

  const handleKeyPress: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.code !== "Enter") {
      return;
    }

    handleSubmit(onSubmit)();
    event.preventDefault();
  };

  useEffect(() => {
    async function loadMessages() {
      await getChatSessionMessages(clientId, senderClientId).then((res) => {
        if (res.length > 0) {
          setMessages(
            res.map(
              (message) =>
                new ChatSessionMessage(
                  message.name,
                  message.message,
                  message.role,
                  new Date(message.createdAt),
                  message.clientId
                )
            )
          );
        }
      });
    }

    loadMessages();
  }, [senderClientId, clientId]);

  useEffect(() => {
    if (messages.length > 0) return;

    const getHistory = async () => {
      let history: Ably.PaginatedResult<Ably.Message> | null =
        await channel.history();
      do {
        const newHistoryMessages: ChatSessionMessage[] = [];

        history.items
          .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
          .forEach((message) => {
            const existingMessage = messages.find(
              (m) =>
                m.message === message.data &&
                new Date(m.createdAt).getTime() ===
                  new Date(message.timestamp!).getTime()
            );
            if (!existingMessage) {
              newHistoryMessages.push(
                new ChatSessionMessage(
                  message.clientId === clientId
                    ? "Bạn"
                    : messages.filter((m) => senderClientId === m.clientId)[0]
                        ?.name ?? "Người dùng",
                  message.data,
                  message.clientId === clientId
                    ? ChatSessionRole.ADMIN
                    : ChatSessionRole.USER,
                  new Date(message.timestamp!),
                  message.clientId === clientId ? clientId : senderClientId
                )
              );
            }
          });

        if (newHistoryMessages.length > 0) {
          setMessages((prevMessages) => [
            ...prevMessages,
            ...newHistoryMessages,
          ]);
        }

        history = await history.next();
      } while (history);
    };
    getHistory();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, senderClientId]);

  useEffect(() => {
    if (messageEnd.current) {
      messageEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  });

  const form = useForm<ChatSupportFormValues>({
    resolver: zodResolver(ChatSupportSchema),
    mode: "onBlur",
    defaultValues: {
      message: "",
    },
  });

  useEffect(() => {
    form.setValue("clientId", senderClientId);
  }, [senderClientId, form]);

  const { control, handleSubmit } = form;

  const message = form.watch("message");

  const onSubmit = async (values: ChatSupportFormValues) => {
    sendChatMessage(values.message);
    form.reset();
    await sendChatSupport(values).then((res) => {
      if (res?.error) {
        toast.error(res.error);
      } else if (typeof res?.success === "string") {
        toast.success(res?.success);
      }
    });
  };

  const toggleSound = () => {
    setIsSoundOn(!isSoundOn);
  };

  if (messages.length > 0 && !senderClientId) {
    return <div>Người dùng đã rời khỏi cuộc trò chuyện</div>;
  }

  if (messages.length === 0) {
    return <div>Tin nhắn hiện đang trống</div>;
  }

  return (
    <div className="flex h-[500px] flex-col">
      <audio ref={audioRef} src="/notification.wav" preload="auto" />
      <div className="flex-1 overflow-y-auto text-main dark:text-white">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div
              key={index}
              className={`my-2 flex gap-3 ${
                message.role === ChatSessionRole.ADMIN
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {message.role === ChatSessionRole.USER && (
                <div className="relative h-8 w-8">
                  <Image
                    src="/logo_icon_light.png"
                    alt="Admin Avatar"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                  />
                </div>
              )}

              <div className="max-w-xs rounded-lg bg-gray-200 p-2 dark:bg-gray-800">
                <div className="text-sm font-semibold">
                  {message.name}{" "}
                  <span className="text-xs text-gray-500">
                    {format(message.createdAt, "HH:mm")}
                  </span>
                </div>
                <div className="text-sm">{message.message}</div>
              </div>

              {message.role === ChatSessionRole.ADMIN && (
                <div className="relative h-8 w-8">
                  <Image
                    src={"/logo_icon_light.png"} // Replace with the actual path to the user avatar
                    alt="User Avatar"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                  />
                </div>
              )}
              <div ref={messageEnd} />
            </div>
          ))
        ) : (
          <div className="text-center">Không có tin nhắn nào.</div>
        )}
      </div>
      <div className="flex items-center p-4">
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex w-full items-center gap-2"
          >
            <FormField
              control={control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      autoFocus
                      onKeyDown={handleKeyPress}
                      placeholder="Nhập tin nhắn..."
                      className="min-h-12"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button disabled={message === ""} type="submit" size="icon">
              <IconArrowElbowLeft />
              <span className="sr-only">Gửi</span>
            </Button>
          </form>
        </Form>

        <button
          type="button"
          onClick={toggleSound}
          className="ml-4 rounded-full bg-gray-200 p-2 dark:bg-gray-700"
        >
          {isSoundOn ? (
            <IconVolume className="h-6 w-6 text-main dark:text-white" />
          ) : (
            <IconVolumeOff className="h-6 w-6 text-main dark:text-white" />
          )}
        </button>
      </div>
    </div>
  );
};
