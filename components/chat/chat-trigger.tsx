"use client";

import { ChatSessionRole } from "@prisma/client";
import {
  IconArrowLeft,
  IconBrandWechat,
  IconRefreshDot,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import Chat from "./chat";
import { Chats } from "./chats";

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

export const ChatTrigger = ({ clientId, chats }: Props) => {
  const [open, setOpen] = useState(false);
  const iconCls = "w-12 h-12 text-primary-500 m-2";
  const icon = open ? (
    <IconX className={iconCls} />
  ) : (
    <IconBrandWechat className={iconCls} />
  );

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-6 z-[9999] w-[300px] rounded-lg bg-white text-main shadow-lg dark:bg-main-component dark:text-white md:w-[35%] lg:w-[25%]">
          <div className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold flex items-center gap-2">
                Hỗ trợ trực tuyến
              </div>
              <IconRefreshDot className="w-6 h-6 cursor-pointer" />
            </div>
            <div className="flex flex-col gap-2">
              <Chat clientId={clientId} chats={chats} />
            </div>
          </div>
        </div>
      )}
      <div className="fixed bottom-6 right-6 z-[9999] rounded-full bg-white shadow-lg dark:bg-main-component">
        <div
          className="flex h-12 w-12 cursor-pointer items-center justify-center"
          onClick={() => setOpen(!open)}
        >
          {icon}
        </div>
      </div>
    </>
  );
};
