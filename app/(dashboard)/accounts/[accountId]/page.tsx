import { AccountIdNavbar } from "@/components/accounts/id/account-id-navbar";
import { AccountWrapper } from "@/components/accounts/id/account-wrapper";
import { GetAccountById, GetAccounts, GetSchoolsAuth } from "@/data/accounts";
import { redirect } from "next/navigation";

type Props = {
  params: {
    accountId: string;
  };
};

export async function generateStaticParams() {
  const accounts = await GetAccounts();

  if (!accounts) {
    redirect("/accounts");
  }

  return accounts.map((account) => ({
    accountId: account.id,
  }));
}

const AccountIdPage = async ({ params }: Props) => {
  const account = await GetAccountById(params.accountId);
  const schools = await GetSchoolsAuth();

  if (!account || !schools) {
    return (
      <div className="flex items-center justify-center font-bold text-3xl text-main dark:text-main-foreground">
        Thông tin tài khoản hoặc trường học không tồn tại
      </div>
    );
  }

  return (
    <>
      <AccountIdNavbar
        id={account.id}
        title="Quản lý thông tin học sinh"
        description={`Học sinh: 
            ${account.name + " - "} (${
          account.student && account.student.studentCode
            ? account.student.studentCode
            : account.emailVerified
            ? "Đã xác thực"
            : "Chưa xác thực"
        })`}
        studentCode={account.student?.studentCode}
        status={account.student?.status}
      />
      <div className="pt-20 size-full">
        <AccountWrapper account={account} schools={schools} />
      </div>
    </>
  );
};

export default AccountIdPage;
