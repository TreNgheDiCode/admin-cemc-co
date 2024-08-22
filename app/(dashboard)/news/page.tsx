"use client";

import { Navbar } from "@/components/navbar";
import NewsTable from "@/components/tables/news/news-table";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Loading from "../loading";

const NewsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = searchParams.get("page");
  const pageSize = searchParams.get("pageSize");

  if (!page || !pageSize) {
    router.push("/news?page=1&pageSize=10");
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
