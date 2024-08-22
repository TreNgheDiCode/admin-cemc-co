import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { GetAccounts } from "@/data/accounts";
import { AccountsDataTable } from "./accounts-data-table";

type Props = {
  page: number;
  pageSize: number;
};

const AccountsTable = async ({ page, pageSize }: Props) => {
  const accounts = await GetAccounts(page, pageSize);

  if (!accounts)
    return (
      <div className="flex items-center justify-center h-40 text-main dark:text-main-foreground text-lg md:text-xl lg:text-3xl xl:text-6xl">
        Không có dữ liệu tài khoản
      </div>
    );

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading title={`Tài khoản (Số lượng: ${accounts?.length})`} />
      </div>
      <Separator />
      <AccountsDataTable accounts={accounts} />
    </>
  );
};

export default AccountsTable;
