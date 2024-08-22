"use client";

import { useRouter } from "next/navigation";
import { StudentStatus } from "@prisma/client";
import { Chip, ChipProps } from "@nextui-org/chip";
import { Heading } from "@/components/heading";
import { QuickSearch } from "@/components/quick-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenuDropdown } from "@/components/user-menu-dropdown";
import { Button } from "@nextui-org/button";
import { useState } from "react";
import { CheckCircle, X } from "lucide-react";
import { acceptAccount, rejectAccount } from "@/action/account";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  id: string;
  title?: string;
  description?: string;
  studentCode?: string | null;
  status?: StudentStatus;
};

const statusColorMap: Record<StudentStatus, ChipProps["color"]> = {
  AWAITING: "default",
  STUDYING: "warning",
  APPROVED: "success",
  DROPPED: "danger",
};

export const AccountIdNavbar = ({
  id,
  title,
  description,
  status,
  studentCode,
}: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [openDecline, setOpenDecline] = useState(false);
  const [additional, setAdditional] = useState("");

  const onAcceptance = async () => {
    setLoading(true);
    await acceptAccount(id)
      .then((res) => {
        if (res?.success) {
          toast.success(res.success);
          router.refresh();
        }
        if (res?.error) {
          toast.error(res.error);
        }
      })
      .finally(() => setLoading(false));
  };

  const onRejectAccount = async () => {
    setLoading(true);
    await rejectAccount(id, additional)
      .then((res) => {
        if (res?.success) {
          toast.success(res.success);
          router.refresh();
          setOpenDecline(false);
        }
        if (res?.error) {
          toast.error(res.error);
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="z-50 rounded-md fixed px-8 flex h-16 items-center max-w-[calc(100vw-144px)] border-b-2 shadow-md w-full dark:bg-main-component bg-main-foreground">
      <Heading title={title} description={description} />
      <div className="flex items-center gap-3">
        {status && (
          <Chip
            className="capitalize"
            color={statusColorMap[status]}
            size="md"
            variant="shadow"
          >
            {status}
          </Chip>
        )}
        {!studentCode && status === "AWAITING" && (
          <>
            <Dialog open={openDecline}>
              <DialogTrigger asChild>
                <Button
                  isDisabled={loading}
                  isLoading={loading}
                  onPress={() => setOpenDecline(true)}
                  color="danger"
                  variant="shadow"
                  size="md"
                  endContent={<X className="size-4 bg-rose-500" />}
                >
                  Từ chối
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="font-semibold text-base md:text-lg lg:text-2xl text-main dark:text-main-foreground">
                    Từ chối hồ sơ
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="additional"
                    className="text-main dark:text-main-foreground font-medium"
                  >
                    Mô tả lý do từ chối
                  </Label>
                  <Textarea
                    id="additional"
                    className="w-full"
                    placeholder="Mô tả lý do từ chối tại đây"
                    value={additional}
                    onChange={(e) => setAdditional(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => setOpenDecline(false)}
                    variant="shadow"
                    color="default"
                  >
                    Hủy
                  </Button>
                  <Button isLoading={loading} onClick={onRejectAccount}>
                    Xác nhận
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              isDisabled={loading}
              isLoading={loading}
              onPress={onAcceptance}
              color="success"
              variant="shadow"
              size="md"
              endContent={<CheckCircle className="size-4 bg-emerald-500" />}
            >
              Duyệt
            </Button>
          </>
        )}
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <QuickSearch />
        <ThemeToggle />
        <UserMenuDropdown />
      </div>
    </div>
  );
};
