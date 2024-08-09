"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { DayPicker } from "react-day-picker";
import { buttonVariants } from "@/components/ui/button";
import { vi } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={vi}
      captionLayout="dropdown-buttons"
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        vhidden: "hidden",
        dropdown_icon: "hidden",
        head: "w-full flex justify-between items-center",
        caption_dropdowns: "flex items-center px-10",
        caption_between: "hidden",
        months: "flex sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-around w-full",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2 justify-around",
        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_selected:
          "bg-main dark:bg-main-foreground dark:hover:bg-main-foreground/70 text-white dark:text-main-background hover:bg-main/70 focus:bg-main/70 focus:text-primary-foreground",
        day_today:
          "bg-main text-white dark:bg-main-foreground dark:text-main-background",
        day_outside: "text-black opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground dark:aria-selected:text-main-foreground dark:aria-selected:bg-main-component",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeftIcon className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRightIcon className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
