import { db } from "@/lib/db";

export const GetNews = async (page: number, pageSize: number) => {
  try {
    const news = await db.news.findMany({
      include: {
        school: {
          select: {
            name: true,
            logo: true,
          },
        },
      },
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
