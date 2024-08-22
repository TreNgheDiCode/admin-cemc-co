"use client";

import { GetAccountById, GetSchoolsAuth } from "@/data/accounts";
import { AccountInformation } from "./account-information";
import { AccountTool } from "./account-tool";
import { useState } from "react";
import RegisterForm from "@/components/forms/register/form/register-form";
import { Button } from "@/components/ui/button";
import { IconArrowLeftBar } from "@tabler/icons-react";

type Props = {
  account: Awaited<ReturnType<typeof GetAccountById>>;
  schools: Awaited<ReturnType<typeof GetSchoolsAuth>>;
};

export enum VIEW_MODE {
  EDIT,
  VIEW,
}
export const AccountWrapper = ({ schools, account }: Props) => {
  const [viewMode, setViewMode] = useState(VIEW_MODE.VIEW);
  return (
    <>
      {viewMode === VIEW_MODE.EDIT ? (
        <div className="space-y-4">
          <Button
            onClick={() => setViewMode(VIEW_MODE.VIEW)}
            className="flex items-center gap-x-2 mx-auto"
          >
            <IconArrowLeftBar />
            <span>Quay lại</span>
          </Button>
          <RegisterForm account={account} schools={schools} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[1fr,300px] gap-4">
          <AccountInformation account={account} />
          <AccountTool account={account} setViewMode={setViewMode} />
        </div>
      )}
    </>
  );
};
