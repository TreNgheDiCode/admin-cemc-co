"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import useFcmToken from "@/hooks/useFcmToken";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { UpsertNotificationToken } from "@/action/notification";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { token } = useFcmToken();
  const { user } = useUser(); // Get the current user from Clerk.

  React.useEffect(() => {
    if (user && !token) {
      toast.error(
        "Không thể nhận thông báo. Vui lòng kiểm tra lại cài đặt thông báo trên trình duyệt của bạn."
      );
    }

    async function upsertToken() {
      if (token && user) {
        const response = await UpsertNotificationToken(token, user.id);
        if (response.error) {
          toast.error(response.error);
        }
      }
    }

    upsertToken();
  }, [user]);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
