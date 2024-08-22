"use client";

import {
  sendEmailVerfication,
  sendPasswordReset,
  updateAccount,
} from "@/action/account";
import RegisterForm from "@/components/forms/register/form/register-form";
import { GetAccountById, GetSchoolsAuth } from "@/data/accounts";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import { Textarea } from "@nextui-org/input";

import { Key, Lock, Mail, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { VIEW_MODE } from "./account-wrapper";

interface StudentToolProps {
  account: Awaited<ReturnType<typeof GetAccountById>>;
  setViewMode: (variant: VIEW_MODE) => void;
}

export const AccountTool = ({
  account,
  setViewMode,
}: Readonly<StudentToolProps>) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onPasswordReset = async () => {
    if (!account || !account.student) return;

    setIsLoading(true);

    await sendPasswordReset(account.email, account.name)
      .then((res) => {
        if (res.error) {
          toast.error(res.error);
        }

        if (res.success) {
          toast.success(res.success);
        }
      })
      .finally(() => setIsLoading(false));
  };

  const onEmailVerification = async () => {
    if (!account || !account.student) return;

    setIsLoading(true);

    await sendEmailVerfication(account.email, account.name)
      .then((res) => {
        if (res.error) {
          toast.error(res.error);
        }

        if (res.success) {
          toast.success(res.success);
        }
      })
      .finally(() => setIsLoading(false));
  };

  const onLockAccount = async () => {
    if (!account) return;

    setIsLoading(true);

    await updateAccount(account.id, { isLocked: true })
      .then((res) => {
        if (res.success) {
          toast.success(res.success);
          router.refresh();
        }

        if (res.error) {
          toast.error(res.error);
        }
      })
      .finally(() => setIsLoading(false));
  };

  const onUnlockAccount = async () => {
    if (!account) return;

    setIsLoading(true);

    await updateAccount(account.id, { isLocked: false })
      .then((res) => {
        if (res.success) {
          toast.success(res.success);
          router.refresh();
        }

        if (res.error) {
          toast.error(res.error);
        }
      })
      .finally(() => setIsLoading(false));
  };

  if (!account || !account.student)
    return (
      <div className="flex items-center justify-center font-bold text-3xl text-main dark:text-main-foreground">
        Thông tin tài khoản không tồn tại
      </div>
    );

  return (
    <Card>
      <CardHeader>
        <h1 className="font-bold text-[#7D1F1F] text-base dark:text-primary">
          Công cụ hỗ trợ
        </h1>
      </CardHeader>
      <Divider />
      <CardBody className="gap-4">
        <Button
          isLoading={isLoading}
          isDisabled={isLoading}
          onPress={() => {
            setViewMode(VIEW_MODE.EDIT);
          }}
          variant="shadow"
          startContent={<Pencil className="size-4" />}
        >
          Chỉnh sửa thông tin
        </Button>
        {!account?.isLocked && (
          <>
            <Button
              isLoading={isLoading}
              isDisabled={isLoading}
              onPress={onPasswordReset}
              variant="shadow"
              startContent={<Key className="size-4" />}
            >
              Gửi y/c khôi phục mật khẩu
            </Button>
            {!account?.emailVerified && (
              <Button
                isLoading={isLoading}
                isDisabled={isLoading}
                onPress={onEmailVerification}
                variant="shadow"
                startContent={<Mail className="size-4" />}
              >
                Gửi y/c xác thực email
              </Button>
            )}
          </>
        )}
        {!account?.isLocked && (
          <Button
            isLoading={isLoading}
            isDisabled={isLoading}
            onPress={() => {}}
            color="danger"
            variant="shadow"
            startContent={<Lock className="size-4" />}
          >
            Khóa tài khoản
          </Button>
        )}
        {account?.isLocked && (
          <Button
            isLoading={isLoading}
            isDisabled={isLoading}
            onPress={() => {}}
            color="success"
            variant="shadow"
            startContent={<Lock className="size-4" />}
          >
            Mở khóa tài khoản
          </Button>
        )}
      </CardBody>
      <Divider />
      <CardFooter className="flex-col items-start">
        <h1 className="font-bold text-[#7D1F1F] text-base dark:text-primary">
          Thông tin bổ sung
        </h1>
        <Textarea
          variant="faded"
          color="warning"
          isReadOnly
          value={account.student?.additional ?? "Không có thông tin"}
        />
      </CardFooter>
    </Card>
  );
};
