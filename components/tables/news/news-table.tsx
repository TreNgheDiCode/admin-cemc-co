import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { GetNews } from "@/data/news";
import { NewsDataTable } from "./news-data-table";

type Props = {
  page: number;
  pageSize: number;
};

const NewsTable = async ({ page, pageSize }: Props) => {
  const news = await GetNews(page, pageSize);

  if (!news)
    return (
      <div className="flex items-center justify-center h-40 text-main dark:text-main-foreground text-lg md:text-xl lg:text-3xl xl:text-6xl">
        Không có dữ liệu tin tức
      </div>
    );

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading title={`Tài khoản (Số lượng: ${news?.length})`} />
      </div>
      <Separator />
      <NewsDataTable news={news} />
    </>
  );
};

export default NewsTable;
