import { ChatTrigger } from "@/components/chat/chat-trigger";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { getChatSessions } from "@/data/chat-support";
import { cn } from "@/lib/utils";
import { cookies } from "next/headers";

type Props = {
  children: React.ReactNode;
};

export const metadata = {
  title: "Bảng điều khiển | CANADA MEDICAL AND EDUCATION",
};

const DashboardLayout = async ({ children }: Props) => {
  const cookieStore = cookies();
  const clientId = cookieStore.get("ably_clientId");

  const chats = await getChatSessions();
  const chatsData = chats.map((chat) => {
    return {
      id: chat.id,
      clientId: chat.clientId,
      name: chat.name,
      updatedAt: chat.updatedAt,
      messages: chat.messages.map((message) => {
        return {
          name: message.name,
          message: message.message,
          role: message.role,
          createdAt: message.createdAt,
          clientId: message.clientId,
        };
      }),
    };
  });

  return (
    <div
      className={cn(
        "relative rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto h-full"
      )}
    >
      <DashboardSidebar />
      <div className="flex flex-1">
        <div className="relative p-2 md:px-10 pt-10 pb-4 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-background flex flex-col gap-2 flex-1 w-full h-full max-h-screen overflow-auto">
          <div className="flex-1 mb-8">{children}</div>
        </div>
      </div>
      <ChatTrigger clientId={clientId?.value ?? ""} chats={chatsData} />
    </div>
  );
};

export default DashboardLayout;
