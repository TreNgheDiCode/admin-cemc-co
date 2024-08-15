import { db } from "@/lib/db";
import { SchoolLib } from "@/types/school";
import { StudentStatus } from "@prisma/client";

export const GetSchools = async () => {
  try {
    // SchoolLib
    const schools: SchoolLib = await db.school
      .findMany({
        where: {
          isPublished: true,
        },
        include: {
          news: true,
          galleries: {
            include: {
              images: true,
            },
          },
          locations: {
            include: {
              contacts: true,
              images: true,
            },
          },
          programs: {
            include: {
              studentPrograms: {
                select: {
                  student: {
                    select: {
                      id: true,
                      studentCode: true,
                      account: {
                        select: {
                          name: true,
                        },
                      },
                      cover: true,
                      degreeType: true,
                      certificateType: true,
                      gradeType: true,
                      gradeScore: true,
                      status: true,
                    },
                  },
                },
              },
            },
          },
          scholarships: {
            include: {
              images: true,
              owners: {
                include: {
                  student: true,
                },
              },
            },
          },
        },
        orderBy: {
          country: "asc",
        },
        cacheStrategy: {
          swr: 300,
          ttl: 3600,
        },
      })
      .withAccelerateInfo();
    return schools;
  } catch (error) {
    console.log("GET SCHOOLS DATA ERROR", error);

    return null;
  }
};

export type SchoolCard = {
  id: string;
  name: string;
  logo: string;
  background: string;
  country: string;
  short: string | null;
  isPublished: boolean;
};

export const GetSchoolsCard = async () => {
  try {
    const schools: SchoolCard[] = await db.school.findMany({
      select: {
        id: true,
        name: true,
        logo: true,
        background: true,
        country: true,
        short: true,
        isPublished: true,
      },
      orderBy: {
        country: "asc",
      },
      cacheStrategy: {
        swr: 300,
        ttl: 3600,
      },
    });

    return schools;
  } catch (error) {
    console.log("GET SCHOOLS CARD DATA ERROR", error);

    return null;
  }
};

export const GetSchoolWrapper = async (schoolId: string) => {
  try {
    const school = await db.school.findUnique({
      where: {
        id: schoolId,
      },
      select: {
        isPublished: true,
        name: true,
      },
    });

    return school;
  } catch (error) {
    console.log("GET SCHOOL WRAPPER DATA ERROR", error);

    return null;
  }
};

export const GetSchoolInformation = async (schoolId: string) => {
  try {
    const school = await db.school.findUnique({
      where: {
        id: schoolId,
      },
    });

    return school;
  } catch (error) {
    console.log("GET SCHOOL INFORMATION DATA ERROR", error);

    return null;
  }
};

export const GetSchoolStudents = async (schoolId: string) => {
  try {
    const students = await db.student.findMany({
      where: {
        schoolId,
        status: {
          in: [StudentStatus.APPROVED, StudentStatus.STUDYING],
        },
      },
      include: {
        account: {
          select: {
            image: true,
            name: true,
            email: true,
            phoneNumber: true,
            dob: true,
            gender: true,
            address: true,
          },
        },
      },
      cacheStrategy: {
        swr: 60,
        ttl: 300,
      },
    });

    return students;
  } catch (error) {
    console.log("GET SCHOOL STUDENTS DATA ERROR", error);

    return [];
  }
};

export const GetSchoolLocations = async (schoolId: string) => {
  try {
    const locations = await db.schoolLocation.findMany({
      where: {
        schoolId,
      },
      cacheStrategy: {
        swr: 60,
        ttl: 300,
      },
    });

    return locations;
  } catch (error) {
    console.log("GET SCHOOL LOCATIONS DATA ERROR", error);

    return [];
  }
};

export const GetSchoolPrograms = async (schoolId: string) => {
  try {
    const programs = await db.schoolProgram.findMany({
      where: {
        schoolId,
      },
      include: {
        _count: {
          select: {
            studentPrograms: true,
          },
        },
      },
      cacheStrategy: {
        swr: 60,
        ttl: 300,
      },
    });

    return programs;
  } catch (error) {
    console.log("GET SCHOOL PROGRAMS DATA ERROR", error);

    return [];
  }
};

export const GetSchoolGalleries = async (schoolId: string) => {
  try {
    const galleries = await db.schoolGallery.findMany({
      where: {
        schoolId,
      },
      include: {
        images: true,
      },
      cacheStrategy: {
        swr: 60,
        ttl: 300,
      },
    });

    return galleries;
  } catch (error) {
    console.log("GET SCHOOL GALLERIES DATA ERROR", error);

    return [];
  }
};

export const GetSchoolScholarships = async (schoolId: string) => {
  try {
    const scholarships = await db.schoolScholarship.findMany({
      where: {
        schoolId,
      },
      include: {
        images: true,
        _count: {
          select: {
            owners: true,
          },
        },
      },
      cacheStrategy: {
        swr: 60,
        ttl: 300,
      },
    });

    return scholarships;
  } catch (error) {
    console.log("GET SCHOOL SCHOLARSHIPS DATA ERROR", error);

    return [];
  }
};

export const GetSchoolNews = async (schoolId: string) => {
  try {
    const news = await db.news.findMany({
      where: {
        schoolId,
      },
      cacheStrategy: {
        swr: 60,
        ttl: 300,
      },
    });

    return news;
  } catch (error) {
    console.log("GET SCHOOL NEWS DATA ERROR", error);

    return [];
  }
};

export const GetSchoolFeedbacks = async (schoolId: string) => {
  try {
    const feedbacks = await db.feedback.findMany({
      where: {
        schoolId,
      },
      include: {
        replies: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return feedbacks;
  } catch (error) {
    console.log("GET SCHOOL FEEDBACKS DATA ERROR", error);

    return [];
  }
};
