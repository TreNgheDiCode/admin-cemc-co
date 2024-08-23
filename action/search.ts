"use server";

import { db } from "@/lib/db";
import { Country, NewsType, StudentStatus } from "@prisma/client";
import { z } from "zod";

const searchSchema = z.object({
  searchQuery: z.string().optional(),
});

type SearchQuery = z.infer<typeof searchSchema>;

export type ClientComponentSearch = {
  id: string;
  image: string;
  name: string;
  chipValue: StudentStatus | Country | NewsType | string;
  type: "schools" | "accounts" | "news";
  schoolSub?: "programs" | "locations" | "scholarships" | "galleries";
  schoolSubId?: string;
};

export const search = async (searchQuery: SearchQuery) => {
  let result: ClientComponentSearch[] = [];
  try {
    const validatedField = searchSchema.safeParse(searchQuery);

    if (!validatedField.success) {
      return result;
    }

    const schools = await db.school.findMany({
      where: {
        name: {
          contains: searchQuery.searchQuery,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        logo: true,
        country: true,
      },
      take: 2,
      cacheStrategy: {
        swr: 30,
        ttl: 100,
      },
    });

    const accounts = await db.account.findMany({
      where: {
        name: {
          contains: searchQuery.searchQuery,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
        student: {
          select: {
            status: true,
          },
        },
      },
      take: 10,
      cacheStrategy: {
        swr: 30,
        ttl: 100,
      },
    });

    const programs = await db.schoolProgram.findMany({
      where: {
        name: {
          contains: searchQuery.searchQuery,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        cover: true,
        school: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      take: 2,
      cacheStrategy: {
        swr: 30,
        ttl: 100,
      },
    });

    const locations = await db.schoolLocation.findMany({
      where: {
        name: {
          contains: searchQuery.searchQuery,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        cover: true,
        school: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      take: 2,
      cacheStrategy: {
        swr: 30,
        ttl: 100,
      },
    });

    const scholarships = await db.schoolScholarship.findMany({
      where: {
        name: {
          contains: searchQuery.searchQuery,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        cover: true,
        school: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      take: 2,
      cacheStrategy: {
        swr: 30,
        ttl: 100,
      },
    });

    const galleries = await db.schoolGallery.findMany({
      where: {
        name: {
          contains: searchQuery.searchQuery,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        cover: true,
        school: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      take: 2,
      cacheStrategy: {
        swr: 30,
        ttl: 100,
      },
    });

    const news = await db.news.findMany({
      where: {
        title: {
          contains: searchQuery.searchQuery,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        title: true,
        cover: true,
        type: true,
      },
      take: 2,
      cacheStrategy: {
        swr: 30,
        ttl: 100,
      },
    });

    Promise.all([schools, accounts]).then((values) => {
      const [schools, accounts] = values;

      schools.forEach((school) => {
        result.push({
          id: school.id,
          image: school.logo,
          name: school.name,
          chipValue: school.country,
          type: "schools",
        });
      });

      accounts.forEach((account) => {
        if (!account.student) {
          return;
        }
        result.push({
          id: account.id,
          image: account.image ?? "/logo_icon_light.png",
          name: account.name,
          chipValue: account.student.status,
          type: "accounts",
        });
      });

      programs.forEach((program) => {
        result.push({
          id: program.school.id,
          image: program.cover ?? "/logo_icon_light.png",
          name: program.name,
          chipValue: program.school.name,
          type: "schools",
          schoolSub: "programs",
          schoolSubId: program.id,
        });
      });

      locations.forEach((location) => {
        result.push({
          id: location.school.id,
          image: location.cover ?? "/logo_icon_light.png",
          name: location.name,
          chipValue: location.school.name,
          type: "schools",
          schoolSub: "locations",
          schoolSubId: location.id,
        });
      });

      scholarships.forEach((scholarship) => {
        result.push({
          id: scholarship.school.id,
          image: scholarship.cover ?? "/logo_icon_light.png",
          name: scholarship.name,
          chipValue: scholarship.school.name,
          type: "schools",
          schoolSub: "scholarships",
          schoolSubId: scholarship.id,
        });
      });

      galleries.forEach((gallery) => {
        result.push({
          id: gallery.school.id,
          image: gallery.cover ?? "/logo_icon_light.png",
          name: gallery.name,
          chipValue: gallery.school.name,
          type: "schools",
          schoolSub: "galleries",
          schoolSubId: gallery.id,
        });
      });

      news.forEach((news) => {
        result.push({
          id: news.id,
          image: news.cover ?? "/logo_icon_light.png",
          name: news.title,
          chipValue: news.type,
          type: "news",
        });
      });
    });

    return result;
  } catch (error) {
    console.log("SEARCH ERROR", error);

    return result;
  }
};
