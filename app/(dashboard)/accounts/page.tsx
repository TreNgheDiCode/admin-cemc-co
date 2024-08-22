import { AccountNavbar } from "@/components/accounts/account-navbar";
import AccountsTable from "@/components/tables/accounts/accounts-table";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Loading from "../loading";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const AccountsPage = ({ searchParams }: Props) => {
  const { page, pageSize } = searchParams;

  if (!page || !pageSize) {
    redirect("/accounts?page=1&pageSize=10");
  }

  return (
    <>
      <AccountNavbar title="Quản lý tài khoản" />
      <div className="pt-20">
        <Suspense fallback={<Loading />}>
          <AccountsTable
            page={parseInt(page as string)}
            pageSize={parseInt(pageSize as string)}
          />
        </Suspense>
      </div>
    </>
  );
};

export default AccountsPage;
