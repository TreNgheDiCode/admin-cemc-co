"use client";

import { ChatSupportFormValues, ChatSupportSchema } from "@/data/form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Ably from "ably";
import { useChannel } from "ably/react";
import { KeyboardEventHandler, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { IconArrowElbowLeft } from "@tabler/icons-react";
import { sendChatSupport } from "@/action/chat-support";
import { toast } from "sonner";

type Props = {
  clientId: string;
  channel: Ably.RealtimeChannel;
};

export const ChatBox = ({ clientId, channel }: Props) => {
  const [receivedMessages, setMessages] = useState<Ably.Message[]>([]);

  let messageEnd = useRef<HTMLDivElement>(null);

  const sendChatMessage = (messageText: string) => {
    channel.publish({ name: "support", data: messageText });
  };

  const handleKeyPress: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.code !== "Enter") {
      return;
    }

    handleSubmit(onSubmit)();
    event.preventDefault();
  };

  useEffect(() => {
    if (receivedMessages.length > 0) return;

    const getHistory = async () => {
      let history: Ably.PaginatedResult<Ably.Message> | null =
        await channel.history();
      do {
        history.items
          .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
          .forEach((message) => {
            setMessages((messages) => [...messages, message]);
          });
        history = await history.next();
      } while (history);
    };
    getHistory();
  }, [receivedMessages.length, channel]);

  useEffect(() => {
    if (messageEnd.current) {
      messageEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  });

  // Get sender client id is not the same as the receiver client id
  const senderClientId = receivedMessages.find(
    (message) => message.clientId !== clientId
  )?.clientId;

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

  if (receivedMessages.length > 0 && !senderClientId) {
    return <div>Người dùng đã rời khỏi cuộc trò chuyện</div>;
  }

  if (receivedMessages.length === 0) {
    return <div>Tin nhắn hiện đang trống</div>;
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 p-4 overflow-y-auto">
        {receivedMessages.map((message, index) => {
          const author =
            message.clientId === clientId ? "Bạn" : "Quản trị viên";

          return (
            <div key={index} className="mb-2">
              <span className="font-bold">
                {author} (
                {new Date(message.timestamp ?? new Date()).toLocaleTimeString()}
                ):{" "}
              </span>
              {message.data}
            </div>
          );
        })}
        <div ref={messageEnd} />
      </div>
      <div className="flex items-center p-4">
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex items-center gap-2 w-full"
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
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="icon">
              <IconArrowElbowLeft />
              <span className="sr-only">Gửi</span>
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
