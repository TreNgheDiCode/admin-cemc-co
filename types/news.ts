import { News } from "@prisma/client";

export type NewsLib = News & {
  school: {
    name: string;
    logo: string;
  } | null;
};
