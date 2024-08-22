import { db } from "@/lib/db";

export const GetFeedbacks = async () => {
  try {
    const feedbacks = await db.feedback.findMany({
      include: {
        replies: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      cacheStrategy: {
        swr: 10,
        ttl: 60,
      },
    });

    return feedbacks;
  } catch (error) {
    console.log("GET FEEDBACKS DATA ERROR", error);

    return [];
  }
};
