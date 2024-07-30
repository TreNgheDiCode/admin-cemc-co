"use client";

import { GetNotificationsPush } from "@/action/notification";
import { useUser } from "@clerk/nextjs";
import { NotificationPush } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const useNotificationsPush = () => {
  const router = useRouter();
  const { user } = useUser();
  const loading = useRef(false);

  const [notifications, setNotifications] = useState<NotificationPush[]>();

  const loadNotifications = async () => {
    if (!user) return;
    if (loading.current) return;

    loading.current = true;

    const data = await GetNotificationsPush(user.id).then((res) => {
      if (res.error) {
        toast.error(res.error);
      } else {
        return res.notifications;
      }
    });

    if (data && data.length > 0) {
      setNotifications(data);
    }

    loading.current = false;
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  return { notifications, loadNotifications };
};
