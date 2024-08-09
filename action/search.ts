"use server";

import { db } from "@/lib/db";
import { Country, StudentStatus } from "@prisma/client";
import { z } from "zod";

const searchSchema = z.object({
  searchQuery: z.string().optional(),
});

type SearchQuery = z.infer<typeof searchSchema>;

export type ClientComponentSearch = {
  id: string;
  image: string;
  name: string;
  chipValue: StudentStatus | Country;
  type: "schools" | "accounts";
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
      take: 5,
      cacheStrategy: {
        ttl: 60,
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
      take: 5,
      cacheStrategy: {
        ttl: 60,
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
    });

    return result;
  } catch (error) {
    console.log("SEARCH ERROR", error);

    return result;
  }
};
