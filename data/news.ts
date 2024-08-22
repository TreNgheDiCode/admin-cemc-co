import { db } from "@/lib/db";
import { NewsLib } from "@/types/news";

export const GetNews = async (page: number, pageSize: number) => {
  try {
    const news: NewsLib[] = await db.news.findMany({
      include: {
        school: {
          select: {
            name: true,
            logo: true,
          },
        },
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
      cacheStrategy: {
        swr: 60,
        ttl: 300,
      },
    });

    return news;
  } catch (error) {
    console.log("GET NEWS DATA ERROR", error);

    return [];
  }
};
