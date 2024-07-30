"use client";

import { SendGeneralNotifications } from "@/action/notification";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { useNotificationsPush } from "@/hooks/use-notifications-push";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const { loadNotifications } = useNotificationsPush();
  const handleTestNotification = async () => {
    await SendGeneralNotifications(
      "Test Notification",
      "This is a test notification"
    ).then((res) => {
      if (res.error) {
        toast.error(res.error);
      }
      router.refresh();
      loadNotifications();
    });
  };

  return (
    <>
      <Navbar title={`Bảng điều khiển`} />
      <main className="py-20 px-10 text-main dark:text-main-foreground">
        <h1 className="text-4xl mb-4 font-bold">
          Firebase Cloud Messaging Demo
        </h1>

        <Button className="mt-5" onClick={handleTestNotification}>
          Send Test Notification
        </Button>
      </main>
    </>
  );
}
