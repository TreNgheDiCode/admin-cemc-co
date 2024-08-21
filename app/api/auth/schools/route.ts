import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const schools = await db.school.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
        name: true,
        country: true,
        logo: true,
        short: true,
        background: true,
        locations: {
          select: {
            name: true,
            images: {
              select: {
                url: true,
              },
            },
            isMain: true,
            cover: true,
            description: true,
          },
        },
        programs: {
          where: {
            isPublished: true,
          },
          select: {
            name: true,
            images: {
              select: {
                url: true,
              },
            },
            cover: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({ schools }, { status: 200 });
  } catch (error) {
    console.log("GET SCHOOLS API ERROR", error);

    return NextResponse.json(
      { error: "Lỗi lấy danh sách trường học" },
      { status: 500 }
    );
  }
}
