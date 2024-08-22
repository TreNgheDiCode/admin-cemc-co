import { Navbar } from "@/components/navbar";
import NewsTable from "@/components/tables/news/news-table";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Loading from "../loading";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const NewsPage = ({ searchParams }: Props) => {
  const { page, pageSize } = searchParams;

  if (!page || !pageSize) {
    redirect("/news?page=1&pageSize=10");
  }

  return (
    <>
      <Navbar title="Quản lý tin tức" />
      <div className="pt-20">
        <Suspense fallback={<Loading />}>
          <NewsTable
            page={parseInt(page as string)}
            pageSize={parseInt(pageSize as string)}
          />
        </Suspense>
      </div>
    </>
  );
};

export default NewsPage;
