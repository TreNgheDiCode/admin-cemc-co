"use client";

import { UpsertNotificationToken } from "@/action/notification";
import useFcmToken from "@/hooks/useFcmToken";
import { useUser } from "@clerk/nextjs";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import * as React from "react";
import { toast } from "sonner";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { token } = useFcmToken();
  const { user } = useUser(); // Get the current user from Clerk.

  React.useEffect(() => {
    if (!user) return;

    async function upsertToken() {
      if (token && user) {
        const response = await UpsertNotificationToken(token, user.id);
        if (response.error) {
          toast.error(response.error);
        }
      }
    }

    upsertToken();
  }, [user, token]);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
