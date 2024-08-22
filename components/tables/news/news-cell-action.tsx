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
import { GetNews } from "@/data/news";
import { NewsLib } from "@/types/news";
import { Edit, MoreHorizontal, ReceiptText, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  news: NewsLib;
};

export const NewsCellAction = ({ news }: Props) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onLockAccount = () => {};

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onLockAccount}
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

          <DropdownMenuItem onClick={() => {}}>
            <ReceiptText className="mr-2 h-4 w-4" /> Xem thông tin chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}}>
            <Edit className="mr-2 h-4 w-4" /> Cập nhật
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Khóa tài khoản
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
