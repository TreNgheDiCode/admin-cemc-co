"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { useNotificationsPush } from "@/hooks/use-notifications-push";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { differenceInMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { MarkNotificationAsRead } from "@/action/notification";

export function NotificationsList() {
  const router = useRouter();
  const { notifications, loadNotifications } = useNotificationsPush();

  const markAsRead = async (id: string) => {
    await MarkNotificationAsRead(id).then((res) => {
      if (res.success) {
        toast.success(res.success);
      } else {
        toast.error(res.error);
      }
    });
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <div className="relative">
            <Bell className="size-4" />
            {notifications?.some((n) => !n.isRead) && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            )}
          </div>
          <span className="sr-only">Notifications list</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[70vh] overflow-y-scroll"
      >
        {notifications?.length === 0 ? (
          <DropdownMenuItem disabled>Không có thông báo mới</DropdownMenuItem>
        ) : (
          notifications?.map((n) => {
            const now = new Date();

            // Calculate minutes ago
            const minutesAgo = differenceInMinutes(now, n.createdAt);
            return (
              <DropdownMenuItem key={n.id}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-2 flex-1">
                    <span className="text-xs font-medium text-main dark:text-main-foreground">
                      {n.title}
                    </span>
                    <p className="text-neutral-700 text-sm dark:text-neutral-300">
                      {n.body}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "text-xs text-gray-500 font-medium",
                          n.isRead
                            ? "text-gray-500"
                            : "text-main dark:text-main-foreground"
                        )}
                      >
                        {minutesAgo < 60
                          ? `${minutesAgo} phút`
                          : `${Math.floor(minutesAgo / 60)} giờ`}
                      </span>
                      -
                      <span className="text-xs text-gray-500">
                        {n.senderName}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      markAsRead(n.id);
                      n.isRead = true;
                    }}
                    disabled={n.isRead}
                    size={"sm"}
                    className="bg-main dark:bg-main-component text-white dark:text-main-foreground hover:bg-main/70 dark:bg-main-component/70"
                  >
                    {n.isRead ? "Đã đọc" : "Đánh dấu đã đọc"}
                  </Button>
                </div>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
