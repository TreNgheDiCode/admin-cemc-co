"use client";

import { IconBrandWechat, IconX } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useState } from "react";

const Chat = dynamic(() => import("@/components/chat/chat"), { ssr: false });

type Props = {
  clientId: string;
};

export const ChatTrigger = ({ clientId }: Props) => {
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
        <div className="absolute bottom-20 right-6 z-50 bg-white dark:bg-main-component rounded-lg shadow-lg md:w-[35%] lg:w-[25%] w-[300px]">
          <div className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Hỗ trợ trực tuyến</div>
            </div>
            <div className="flex flex-col gap-2">
              <Chat clientId={clientId} />
            </div>
          </div>
        </div>
      )}
      <div className="absolute bottom-6 right-6 z-50 bg-white dark:bg-main-component rounded-full shadow-lg">
        <div
          className="flex items-center justify-center w-12 h-12 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          {icon}
        </div>
      </div>
    </>
  );
};
