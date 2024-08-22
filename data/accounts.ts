import { db } from "@/lib/db";
import { AccountLib } from "@/types/account";

export const GetAccountByEmail = async (email: string) => {
  try {
    const user = await db.account.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        password: true,
        emailVerified: true,
        name: true,
        dob: true,
        phoneNumber: true,
        student: {
          select: {
            id: true,
            studentCode: true,
            scholarship: {
              select: {
                status: true,
                description: true,
                scholarship: {
                  select: {
                    name: true,
                    cover: true,
                    images: true,
                    description: true,
                  },
                },
              },
            },
            tuitions: {
              select: {
                status: true,
                amount: true,
                description: true,
                dueAt: true,
              },
            },
            status: true,
            school: {
              select: {
                id: true,
                name: true,
                logo: true,
                background: true,
              },
            },
            requirements: {
              select: {
                id: true,
                title: true,
                images: true,
                replies: {
                  select: {
                    message: true,
                    senderName: true,
                    createdAt: true,
                  },
                },
                status: true,
                description: true,
              },
            },
            program: {
              select: {
                program: {
                  select: {
                    name: true,
                  },
                },
                scores: {
                  select: {
                    title: true,
                    semester: true,
                    year: true,
                    subjects: {
                      select: {
                        name: true,
                        score: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        isLocked: true,
      },
    });

    return user;
  } catch (error) {
    console.log("GET ACCOUNT BY EMAIL ERROR", error);
    return null;
  }
};

export const GetAccounts = async (page: number = 1, pageSize: number = 10) => {
  try {
    const accounts: AccountLib[] = await db.account.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        dob: true,
        gender: true,
        createdAt: true,
        emailVerified: true,
        phoneNumber: true,
        address: true,
        idCardNumber: true,
        isTwoFactorEnabled: true,
        student: {
          select: {
            id: true,
            studentCode: true,
            status: true,
          },
        },
        isLocked: true,
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    return accounts;
  } catch (error) {
    console.log("GET ACCOUNTS DATA ERROR", error);

    return null;
  }
};
