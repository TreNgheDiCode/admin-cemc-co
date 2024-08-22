"use client";

import {
  MarkAsNotSpam,
  MarkAsRead,
  MarkAsResolved,
  MarkAsSpam,
  MarkAsUnread,
  reply,
} from "@/action/feedback";
import Loading from "@/components/loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { LinkPreview } from "@/components/ui/link-preview";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { GetFeedbacks } from "@/data/feedbacks";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { Input } from "@nextui-org/input";
import { Selection } from "@nextui-org/table";
import { Feedback, FeedbackReply, FeedbackReplyRole } from "@prisma/client";
import {
  IconCopy,
  IconLink,
  IconMail,
  IconMessage2,
  IconPhone,
  IconPhoto,
  IconRepeat,
  IconUser,
} from "@tabler/icons-react";
import { addDays, differenceInMinutes, format, subDays } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, ChevronDown, SearchIcon } from "lucide-react";
import { marked } from "marked";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

const readOptions = [
  { name: "Đã đọc", uid: "true" },
  { name: "Chưa đọc", uid: "false" },
];

const typeOptions = [
  { name: "Phản hồi", uid: "FEEDBACK" },
  { name: "Hệ thống", uid: "SYSTEM" },
  { name: "Hoàn trả", uid: "REFUND" },
  { name: "Hóa đơn", uid: "BILLING" },
  { name: "Đăng ký", uid: "SUBSCRIPTION" },
  { name: "Học bổng", uid: "SCHOLARSHIP" },
  { name: "Khác", uid: "UNKNOWN" },
  { name: "Chung", uid: "GENERAL" },
  { name: "Thủ tục", uid: "PROCEDURE" },
  { name: "Hỏi đáp", uid: "QUESTION" },
];

const typeLabelMap: Record<
  string,
  { label: string; backgroundColor: string; textColor: string }
> = {
  FEEDBACK: {
    label: "Phản hồi",
    backgroundColor: "#3498db",
    textColor: "#ffffff",
  },
  SYSTEM: {
    label: "Hệ thống",
    backgroundColor: "#2ecc71",
    textColor: "#ffffff",
  },
  REFUND: {
    label: "Hoàn trả",
    backgroundColor: "#e74c3c",
    textColor: "#ffffff",
  },
  BILLING: {
    label: "Hóa đơn",
    backgroundColor: "#9b59b6",
    textColor: "#ffffff",
  },
  SUBSCRIPTION: {
    label: "Đăng ký",
    backgroundColor: "#f39c12",
    textColor: "#ffffff",
  },
  SCHOLARSHIP: {
    label: "Học bổng",
    backgroundColor: "#1abc9c",
    textColor: "#ffffff",
  },
  UNKNOWN: { label: "Khác", backgroundColor: "#95a5a6", textColor: "#ffffff" },
  GENERAL: { label: "Chung", backgroundColor: "#34495e", textColor: "#ffffff" },
  PROCEDURE: {
    label: "Thủ tục",
    backgroundColor: "#27ae60",
    textColor: "#ffffff",
  },
  QUESTION: {
    label: "Hỏi đáp",
    backgroundColor: "#f39c12",
    textColor: "#ffffff",
  },
};

type Props = {
  feedbacks: Awaited<ReturnType<typeof GetFeedbacks>>;
};

type FeedbackItem = Awaited<ReturnType<typeof GetFeedbacks>>[0];

export const FeedbacksWrapper = ({ feedbacks }: Props) => {
  const { user } = useUser();
  const [loading, setLoading] = useState<boolean>(false);
  const [filterSearchValue, setFilterSearchValue] = useState<string>("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 10),
    to: addDays(new Date(), 20),
  });
  const [readFilter, setReadFilter] = useState<Selection>("all");
  const [typeFilter, setTypeFilter] = useState<Selection>("all");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const feedbackId = searchParams.get("feedbackId");
  const [feedback, setFeedback] = useState<
    (Feedback & { replies: FeedbackReply[] }) | undefined
  >(undefined);

  const [replies, setReplies] = useState<FeedbackReply[]>([]);

  const ReplyEditor = dynamic(() => import("./reply-editor"), {
    loading: () => <Loading />,
  });

  useEffect(() => {
    async function fetchData() {
      if (feedbackId) {
        const feedback = feedbacks.find(
          (feedback) => feedback.id === feedbackId
        );
        if (feedback) {
          if (!feedback.isRead) {
            setIsVisiting(true);
            await MarkAsRead(feedback.id)
              .catch((error) => {
                toast.error("Đổi trạng thái phản hồi thất bãi", error);
              })
              .finally(() => setIsVisiting(false));

            feedback.isRead = true;

            router.refresh();
          }

          setFeedback(feedback);

          if (feedback.replies) {
            setReplies(feedback.replies);
          }

          return;
        }
      }
    }

    fetchData();
  }, [feedbackId, feedbacks, router]);

  useEffect(() => {
    if (!type) {
      router.replace(pathname + "?type=inbox");
    }
  }, [type, pathname, router]);

  const hasSearchValue = Boolean(filterSearchValue);
  const hasDateRangeValue = Boolean(date);

  const filteredItems = useMemo(() => {
    let filteredFeedbacks = [...feedbacks];

    if (hasSearchValue) {
      filteredFeedbacks = filteredFeedbacks.filter((feedback) =>
        Object.values(feedback).some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(filterSearchValue.toLowerCase())
        )
      );
    }

    if (hasDateRangeValue) {
      filteredFeedbacks = filteredFeedbacks.filter((feedback) => {
        const createdAt = new Date(feedback.createdAt);

        if (!date) return;
        if (!date.from || !date.to) return;

        return createdAt >= date.from && createdAt <= date.to;
      });
    }

    if (
      readFilter !== "all" &&
      Array.from(readFilter).length !== readOptions.length
    ) {
      filteredFeedbacks = filteredFeedbacks.filter((feedback) =>
        Array.from(readFilter).includes(feedback.isRead.toString())
      );
    }

    if (
      typeFilter !== "all" &&
      Array.from(typeFilter).length !== typeOptions.length
    ) {
      filteredFeedbacks = filteredFeedbacks.filter((feedback) =>
        Array.from(typeFilter).includes(feedback.type)
      );
    }

    if (type) {
      if (type === "inbox") {
        filteredFeedbacks = filteredFeedbacks.filter(
          (feedback) => !feedback.isResolved && !feedback.isSpam
        );
      }

      if (type === "resolved") {
        filteredFeedbacks = filteredFeedbacks.filter(
          (feedback) => feedback.isResolved
        );
      }

      if (type === "spam") {
        filteredFeedbacks = filteredFeedbacks.filter(
          (feedback) => feedback.isSpam && !feedback.isResolved
        );
      }
    }

    return filteredFeedbacks;
  }, [
    feedbacks,
    filterSearchValue,
    date,
    readFilter,
    typeFilter,
    hasSearchValue,
    hasDateRangeValue,
    type,
  ]);

  const onTabChange = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      const newParams = params.toString();

      const newPathname = pathname + "?" + newParams;

      router.replace(newPathname);
    },
    [searchParams, pathname, router]
  );

  const onSearchNameChange = useCallback((value?: string) => {
    if (value) {
      setFilterSearchValue(value);
    } else {
      setFilterSearchValue("");
    }
  }, []);

  const onDateRangeChange = useCallback((value?: DateRange) => {
    if (value) {
      setDate(value);
    } else {
      setDate(undefined);
    }
  }, []);

  const onClearSearchName = useCallback(() => {
    setFilterSearchValue("");
  }, []);

  const onReply = async (markdown: string) => {
    if (!markdown || markdown === "") {
      toast.error("Nội dung không được để trống");
      return;
    }

    if (!user?.fullName || user.fullName === "") {
      toast.error("Tên người gửi không được để trống");
      return;
    }

    if (!feedbackId) {
      toast.error("Không tìm thấy mã phản hồi");
      return;
    }

    setLoading(true);

    await reply(feedbackId, markdown, user.fullName, user?.imageUrl)
      .then((res) => {
        if (res.error) {
          toast.error(res.error);
          return;
        }

        if (res.success) {
          toast.success(res.success);
          setReplies([res.data, ...replies]);
        }
      })
      .finally(() => setLoading(false));
    router.refresh();
  };

  const [isVisiting, setIsVisiting] = useState<boolean>(false);

  const onVisitFeedback = useCallback(
    async (feedback: FeedbackItem) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("feedbackId", feedback.id);

      const newParams = params.toString();
      const newPathname = `${pathname}?${newParams}`;

      router.replace(newPathname);

      if (!feedback.isRead) {
        setIsVisiting(true);
        await MarkAsRead(feedback.id)
          .catch((error) => {
            toast.error("Đổi trạng thái phản hồi thất bại", error);
          })
          .finally(() => setIsVisiting(false));

        feedback.isRead = true;
        router.refresh();
      }

      setFeedback(feedback);

      if (feedback.replies) {
        setReplies(feedback.replies);
      }
    },
    [router, searchParams, pathname]
  );

  const onReadFeedback = useCallback(
    async (feedback: FeedbackItem) => {
      if (!feedback.id) {
        toast.error("Không tìm thấy mã phản hồi");
        return;
      }

      const action = feedback.isRead ? MarkAsUnread : MarkAsRead;

      setIsVisiting(true);
      await action(feedback.id)
        .then((res) => {
          if (res.success) {
            toast.success(res.success);
          } else {
            toast.error(res.error);
          }
        })
        .finally(() => setIsVisiting(false));

      feedback.isRead = !feedback.isRead;

      router.refresh();

      setFeedback(feedback);
    },
    [router]
  );

  const onMarkAsSpam = useCallback(
    async (feedback: FeedbackItem) => {
      if (!feedback.id) {
        toast.error("Không tìm thấy mã phản hồi");
        return;
      }

      setIsVisiting(true);

      const action = feedback.isSpam ? MarkAsNotSpam : MarkAsSpam;

      await action(feedback.id)
        .then((res) => {
          if (res.success) {
            toast.success(res.success);
          } else {
            toast.error(res.error);
          }
        })
        .finally(() => setIsVisiting(false));

      feedback.isSpam = !feedback.isSpam;

      router.refresh();

      if (feedback.isSpam && type !== "spam") {
        onTabChange("type", "spam");
      } else {
        onTabChange("type", "inbox");
      }

      setFeedback(feedback);
    },
    [router, type, onTabChange]
  );

  const onMarkAsResolved = useCallback(
    async (feedback: FeedbackItem) => {
      if (!feedback.id) {
        toast.error("Không tìm thấy mã phản hồi");
        return;
      }

      setIsVisiting(true);
      await MarkAsResolved(feedback.id)
        .then((res) => {
          if (res.success) {
            toast.success(res.success);
          } else {
            toast.error(res.error);
          }
        })
        .finally(() => setIsVisiting(false));

      feedback.isResolved = true;

      router.refresh();

      if (type !== "resolved") {
        onTabChange("type", "resolved");
      }

      setFeedback(feedback);
    },
    [router, type, onTabChange]
  );

  return (
    <div className="size-full flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 rounded-md bg-transparent shadow-md p-2 flex items-center gap-2">
          <Dropdown>
            <DropdownTrigger className="w-full hidden sm:flex">
              <Button
                endContent={<ChevronDown className="text-small ml-auto" />}
                variant="bordered"
                className="bg-white dark:bg-main-background"
                size="sm"
              >
                Hiển thị
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Table Columns"
              closeOnSelect={false}
              selectedKeys={readFilter}
              selectionMode="multiple"
              onSelectionChange={setReadFilter}
            >
              {readOptions.map((read) => (
                <DropdownItem key={read.uid} className="capitalize">
                  {read.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownTrigger className="w-full hidden sm:flex">
              <Button
                endContent={<ChevronDown className="text-small ml-auto" />}
                variant="bordered"
                className="bg-white dark:bg-main-background"
                size="sm"
              >
                Loại hình
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Table Columns"
              closeOnSelect={false}
              selectedKeys={typeFilter}
              selectionMode="multiple"
              onSelectionChange={setTypeFilter}
            >
              {typeOptions.map((type) => (
                <DropdownItem key={type.uid} className="capitalize">
                  {type.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="col-span-1 md:col-span-2 rounded-md flex items-center gap-2 bg-transparent shadow-md p-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"bordered"}
                size="sm"
                className={cn(
                  "w-[300px] justify-start text-left font-normal bg-white dark:bg-main-background",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                      {format(date.to, "dd/MM/yyyy", { locale: vi })}
                    </>
                  ) : (
                    format(date.from, "dd/MM/yyyy", { locale: vi })
                  )
                ) : (
                  <span>Lọc theo ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={onDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Input
            isClearable
            size="sm"
            variant="bordered"
            className="w-full bg-white dark:bg-main-background"
            placeholder="Tìm kiếm..."
            startContent={<SearchIcon />}
            value={filterSearchValue}
            onClear={() => onClearSearchName()}
            onValueChange={onSearchNameChange}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 size-full overflow-auto">
        <div className="scrollbar-hide size-full rounded-md relative border border-neutral-100 bg-white dark:bg-main-background shadow-md dark:border-neutral-800 p-2 overflow-y-scroll">
          <Tabs
            onValueChange={(value) => {
              if (value === "inbox") {
                onTabChange("type", "inbox");
              }
              if (value === "resolved") {
                onTabChange("type", "resolved");
              }
              if (value === "spam") {
                onTabChange("type", "spam");
              }
            }}
            value={type ?? "inbox"}
            className="sticky top-0 left-0 w-full z-10"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inbox">Phản hồi</TabsTrigger>
              <TabsTrigger value="resolved">Đã giải quyết</TabsTrigger>
              <TabsTrigger value="spam">Spam</TabsTrigger>
            </TabsList>
            <TabsContent value="inbox"></TabsContent>
            <TabsContent value="resolved"></TabsContent>
            <TabsContent value="spam"></TabsContent>
          </Tabs>
          <div className="p-1 space-y-2">
            {filteredItems.map((feedback) => {
              const now = new Date();
              const active = feedbackId === feedback.id;

              // Calculate minutes ago
              const minutesAgo = differenceInMinutes(now, feedback.createdAt);
              let hoursAgo = 0;
              let daysAgo = 0;
              let monthsAgo = 0;

              if (minutesAgo >= 60 * 24 * 30) {
                monthsAgo = Math.floor(minutesAgo / (60 * 24 * 30));
              } else if (minutesAgo >= 60 * 24) {
                daysAgo = Math.floor(minutesAgo / (60 * 24));
              } else if (minutesAgo >= 60) {
                hoursAgo = Math.floor(minutesAgo / 60);
              }

              return (
                <div
                  key={feedback.id}
                  className={cn(
                    "group dark:text-neutral-500 border-main-component dark:border-black border-2 rounded-md p-2 bg-transparent flex flex-col transition hover:cursor-pointer",
                    active &&
                      "border-main bg-main/30 dark:border-main-foreground  dark:bg-main-foreground/30 text-main dark:text-main-foreground",
                    !active &&
                      "hover:bg-main/10 dark:hover:bg-main-foreground/10"
                  )}
                  onClick={() => {
                    if (feedbackId === feedback.id) {
                      const params = new URLSearchParams(
                        searchParams.toString()
                      );
                      params.delete("feedbackId");

                      const newParams = params.toString();

                      const newPathname = pathname + "?" + newParams;

                      setFeedback(undefined);
                      setReplies([]);

                      router.replace(newPathname);
                    } else {
                      onVisitFeedback(feedback);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="group-hover:text-main dark:group-hover:text-main-foreground font-semibold text-base line-clamp-1">
                      {!feedback.isRead && (
                        <div className="size-4 bg-red-500 rounded-full"></div>
                      )}
                      {feedback.title}
                    </span>
                    <span className="underline text-sm font-thin whitespace-nowrap">
                      {monthsAgo > 0 && `${monthsAgo} tháng trước`}
                      {daysAgo > 0 && `${daysAgo} ngày trước`}
                      {hoursAgo > 0 && `${hoursAgo} giờ trước`}
                      {minutesAgo < 60
                        ? `${minutesAgo} phút trước`
                        : minutesAgo < 1
                        ? "vừa xong"
                        : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-xs flex items-center gap-2">
                      <IconUser className="size-4" />
                      {feedback.name}
                    </span>
                    <div className="flex gap-2">
                      <ChipTag>{feedback.type}</ChipTag>
                    </div>
                  </div>
                  <p className="text-sm line-clamp-2 text-muted-foreground">
                    Nội dung: {feedback.message}
                  </p>
                  <div className="mt-2 uppercase flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <IconMail className="size-4" />
                      <a
                        href={`mailto:${feedback.email}`}
                        className="text-xs underline"
                      >
                        {feedback.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      {feedback.image && <IconPhoto className="size-4" />}
                      {feedback.url && <IconLink className="size-4" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {isVisiting && (
          <div className="fixed top-0 left-0 w-full h-full bg-white bg-opacity-90 flex items-center justify-center z-50">
            <TextGenerateEffect words="Đang tải..." />
          </div>
        )}
        {!isVisiting && feedback ? (
          <div className="size-full rounded-md border border-neutral-100 bg-white dark:bg-main-background shadow-md dark:border-neutral-800 p-4 col-span-1 md:col-span-2 overflow-y-scroll">
            <div className="flex items-center justify-between gap-8">
              <span className="font-semibold text-base uppercase line-clamp-2">
                <ChipTag className="mr-2">{feedback.type}</ChipTag>
                {feedback.title}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="shadow"
                  color="success"
                  className="font-medium text-white"
                  onClick={() => onMarkAsResolved(feedback)}
                >
                  Đóng phản hồi (Giải quyết)
                </Button>
                <Button
                  onClick={() => onMarkAsSpam(feedback)}
                  size="sm"
                  variant="bordered"
                >
                  {feedback.isSpam ? "Chuyển đến Phản hồi" : "Đánh dấu Spam"}
                </Button>
                <Button
                  onClick={() => {
                    onReadFeedback(feedback);
                  }}
                  size="sm"
                  variant="bordered"
                >
                  Đánh dấu {feedback.isRead ? "Chưa đọc" : "Đã đọc"}
                </Button>
              </div>
            </div>
            <Separator className="my-3 bg-black dark:bg-white" />
            <div className="flex items-center justify-between">
              <span className="font-medium text-base">
                Người yêu cầu: <strong>{feedback.name}</strong>
              </span>
              <span className="text-sm font-thin underline flex items-center">
                <IconRepeat
                  className="mr-2 size-4 cursor-pointer"
                  onClick={() => router.refresh()}
                />
                {format(new Date(feedback.createdAt), "dd/MM/yyyy", {
                  locale: vi,
                })}{" "}
                vào lúc{" "}
                {format(new Date(feedback.createdAt), "HH:mm", {
                  locale: vi,
                })}
              </span>
            </div>
            <p className="text-base my-1 flex items-center gap-1">
              <a href={`mailto:${feedback.email}`} className="hover:underline">
                {feedback.email}
              </a>
              <IconMail className="size-4 text-main dark:text-main-foreground" />{" "}
              •{" "}
              <a href={`tel:${feedback.phone}`} className="hover:underline">
                {feedback.phone}
              </a>
              <IconPhone className="size-4 text-main dark:text-main-foreground" />
            </p>
            <div className="mt-4 flex items-stretch bg-main/30 dark:bg-main-foreground/30 gap-4">
              <div className="w-2 bg-main dark:bg-main-foreground" />
              <div className="flex flex-col">
                <p className="text-sm flex-1 my-3 font-normal">
                  {feedback.message}
                </p>
                {feedback.image && (
                  <div className="relative my-3 rounded-sm aspect-video max-w-[70%]">
                    <Image
                      fill
                      src={feedback.image}
                      alt={feedback.title}
                      className="object-cover object-center"
                    />
                  </div>
                )}
              </div>
            </div>
            <h2 className="mt-4 mb-2 text-xl font-semibold text-main dark:text-main-foreground flex items-center">
              <IconLink className="size-5 mr-2" />
              Đường dẫn
            </h2>
            <div className="flex p-2 items-center justify-between rounded-md border-main dark:border-main-component shadow-md">
              {feedback.url && (
                <>
                  <LinkPreview
                    url={feedback.url}
                    className="hover:underline text-main dark:text-main-foreground text-sm"
                  >
                    {feedback.url}
                  </LinkPreview>
                  <Button
                    size="sm"
                    variant="bordered"
                    className="text-main dark:text-main-foreground"
                    onClick={() => {
                      navigator.clipboard.writeText(feedback.url ?? "");
                      toast.info("Đã sao chép đường dẫn", {
                        duration: 500,
                      });
                    }}
                  >
                    <IconCopy className="size-4" />
                    Sao chép
                  </Button>
                </>
              )}
              {!feedback.url && (
                <span className="text-muted-foreground text-sm">
                  Không có đường dẫn
                </span>
              )}
            </div>
            <h2 className="my-6 text-xl font-semibold text-main dark:text-main-foreground flex items-center">
              <IconMessage2 className="size-5 mr-2" />
              Phản hồi
            </h2>
            <div className="flex items-center gap-4 mb-8">
              <Avatar>
                <AvatarImage
                  src={user?.imageUrl ?? "/logo_icon_light.png"}
                  alt={user?.fullName ?? "Tên người dùng"}
                />
                <AvatarFallback>
                  <Image
                    fill
                    src={"/logo_icon_light.png"}
                    alt={user?.fullName ?? "Tên người dùng"}
                  />
                </AvatarFallback>
              </Avatar>
              <ReplyEditor onReply={(markdown) => onReply(markdown)} />
            </div>
            {replies.length > 0 ? (
              <div className="space-y-3">
                {replies.map((reply) => (
                  <div key={reply.id} className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage
                        src={reply.logo ?? "/logo_icon_light.png"}
                        alt={reply.senderName}
                      />
                      <AvatarFallback>
                        <Image
                          fill
                          src={"/logo_icon_light.png"}
                          alt={reply.senderName}
                        />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 border-2 rounded-md border-main dark:border-main-component p-2 flex items-center gap-8">
                      <p className="flex-1 text-sm space-y-1">
                        <strong>
                          {reply.senderName}
                          {reply.role === FeedbackReplyRole.ADMIN && (
                            <Chip color="danger" size="sm" className="ml-2">
                              Quản trị viên
                            </Chip>
                          )}
                          :
                        </strong>
                        <br />
                        <div
                          dangerouslySetInnerHTML={{
                            __html: marked(reply.message),
                          }}
                        />
                      </p>
                      <span className="text-muted-foreground text-xs underline">
                        {format(new Date(reply.createdAt), "dd/MM/yyyy", {
                          locale: vi,
                        })}{" "}
                        vào lúc{" "}
                        {format(new Date(reply.createdAt), "HH:mm", {
                          locale: vi,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-main dark:text-main-foreground text-2xl">
                Danh sách phản hồi trống
              </div>
            )}
          </div>
        ) : (
          <div className="size-full flex flex-col items-center justify-center rounded-md relative border border-neutral-100 bg-white dark:bg-main-background shadow-md dark:border-neutral-800 p-2 col-span-1 md:col-span-2">
            <Image
              width={200}
              height={200}
              priority
              quality={100}
              src={"/empty-feedback-light.gif"}
              alt="empty feedback gif"
              className="block dark:hidden"
              unoptimized
            />
            <Image
              width={200}
              height={200}
              priority
              quality={100}
              src={"/empty-feedback-dark.gif"}
              alt="empty feedback gif"
              className="hidden dark:block"
              unoptimized
            />
            <span className="text-muted-foreground text-lg">
              <TextGenerateEffect words="Chọn một phản hồi để xem chi tiết" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const ChipTag = ({
  children,
  className,
}: {
  children: string;
  className?: string;
}) => {
  const type = children.toUpperCase();
  const { label, backgroundColor, textColor } = typeLabelMap[type] || {
    label: "Không xác định",
    backgroundColor: "#bdc3c7",
    textColor: "#2c3e50",
  };

  return (
    <span
      className={cn("text-xs px-2 py-1 rounded-full", className)}
      style={{ backgroundColor, color: textColor }}
    >
      {label}
    </span>
  );
};
