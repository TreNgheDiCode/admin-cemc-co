"use client";

import { AlertModal } from "@/components/modal/alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountLib } from "@/types/account";
import { IconLockOpen, IconScript } from "@tabler/icons-react";
import { MoreHorizontal, ReceiptText, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { lockAccount, unlockAccount } from "../../../action/account";
import { toast } from "sonner";

type Props = {
  account: AccountLib;
};

export const AccountCellAction = ({ account }: Props) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onLockAccount = async () => {
    setLoading(true);
    await lockAccount(account.id)
      .then((res) => {
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(res.success);
          setOpen(false);
          router.refresh();
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onUnlockAccount = async () => {
    setLoading(true);
    await unlockAccount(account.id)
      .then((res) => {
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(res.success);
          router.refresh();
          setOpen(false);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={account.isLocked ? onUnlockAccount : onLockAccount}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Hành động</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => {
              router.push(`/accounts/${account.id}`);
            }}
          >
            <ReceiptText className="mr-2 h-4 w-4" /> Xem thông tin chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            {!account.isLocked && (
              <>
                <Trash className="mr-2 h-4 w-4" /> Khóa tài khoản
              </>
            )}
            {account.isLocked && (
              <>
                <IconLockOpen className="mr-2 h-4 w-4" /> Mở khóa tài khoản
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
