import { GetSchoolNews } from "@/data/schools";
import Image from "next/image";
import { BentoGrid, BentoGridItem } from "../ui/bento-grid";
import { PlusCircle } from "lucide-react";

type Props = {
  schoolId: string;
};

const Header = (src: string, title: string) => (
  <Image
    width={793}
    height={417}
    priority
    quality={100}
    src={src}
    alt={title}
    className="min-h-60 size-full rounded-lg object-cover object-top"
  />
);

const Content = (content: string) => {
  content = content.replace(/<[^>]*>?/gm, "");

  if (content.length > 100) {
    return content.slice(0, 255) + "...";
  }

  return content;
};

export const SchoolNewsList = async ({ schoolId }: Props) => {
  const news = await GetSchoolNews(schoolId);

  return (
    <div className="flex flex-col gap-4">
      <BentoGrid className="mx-auto md:auto-rows-[30rem]">
        {news.map((item, i) => {
          if (i === 0) {
            return (
              <BentoGridItem
                key={i}
                title={item.title}
                description={Content(item.content)}
                header={Header(item.cover, item.title)}
                className="md:col-span-2"
              />
            );
          }
          return (
            <BentoGridItem
              key={i}
              title={item.title}
              description={Content(item.content)}
              header={Header(item.cover, item.title)}
              className="md:col-span-1"
            />
          );
        })}
      </BentoGrid>
      <div className="size-full flex items-center justify-center">
        <button className="shadow-[0_0_0_3px_#7d1f1f_inset] dark:shadow-[0_0_0_3px_#f5f5f5_inset] px-6 py-2 bg-transparent border border-main dark:border-main-foreground dark:text-main-foreground text-main rounded-2xl font-bold transform hover:-translate-y-1 transition duration-400 text-xl flex items-center">
          <PlusCircle className="size-6 mr-2" />
          Thêm tin tức
        </button>
      </div>
    </div>
  );
};
