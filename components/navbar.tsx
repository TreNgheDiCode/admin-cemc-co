"use client";

import { usePathname, useRouter } from "next/navigation";
import { Heading } from "./heading";
import { NotificationsList } from "./notifications-list";
import { QuickSearch } from "./quick-search";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { UserMenuDropdown } from "./user-menu-dropdown";
import { IconRefreshDot } from "@tabler/icons-react";

type Props = {
  title?: string;
  description?: string;
};

if (process.env.NODE_ENV !== "production") {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    // Check if the warning message contains specific text or condition
    if (args[0].includes("Skipping auto-scroll behavior")) {
      return; // Suppress the warning
    }
    originalWarn.apply(console, args); // Otherwise, log the warning
  };
}

export const Navbar = ({ title, description }: Props) => {
  const pathname = usePathname();
  const router = useRouter();

  // Kiểm tra pathname có chứa 2 dấu gạch chéo hay không
  const isRoot = pathname.split("/").length === 2;

  return (
    <>
      {/*  */}
      <div className="z-50 rounded-md fixed px-8 flex h-16 items-center lg:max-w-[calc(100vw-144px)] border-b-2 shadow-md w-[98vw] dark:bg-main-component bg-main-foreground">
        <Heading title={title} description={description} />
        <div className="items-center gap-4 ml-auto hidden lg:flex">
          <IconRefreshDot
            className="size-8 ml-2.5 text-main cursor-pointer dark:text-main-foreground hover:animate-spin"
            onClick={() => router.refresh()}
          />
          <QuickSearch />
          {!isRoot && (
            <Button
              variant={"outline"}
              size={"sm"}
              onClick={() => {
                router.push("/" + pathname.split("/")[1]);
              }}
            >
              Quay về trang chính
            </Button>
          )}
          <NotificationsList />
          <ThemeToggle />
          <UserMenuDropdown />
        </div>
      </div>
    </>
  );
};
