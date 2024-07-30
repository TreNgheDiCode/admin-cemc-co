import { db } from "@/lib/db";
import admin from "firebase-admin";
import { Message } from "firebase-admin/messaging";
import { NextRequest, NextResponse } from "next/server";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function POST(request: NextRequest) {
  const { userId, token } = await request.json();

  try {
    if (userId) {
      const existingToken = await db.notificationToken.findFirst({
        where: {
          userId,
        },
      });

      if (existingToken) {
        await db.notificationToken.update({
          where: {
            id: existingToken.id,
          },
          data: {
            token,
          },
        });
      } else {
        await db.notificationToken.create({
          data: {
            token,
            userId,
          },
        });

        const payload: Message = {
          token,
          notification: {
            title: "Welcome to CEMC",
            body: "You will now receive notifications from CEMC",
          },
          android: {
            notification: {
              clickAction: "FLUTTER_NOTIFICATION_CLICK",
            },
          },
          apns: {
            payload: {
              aps: {
                category: "CEMC",
              },
            },
          },
        };

        await admin.messaging().send(payload);

        return NextResponse.json({
          success: true,
          message: "Cập nhật token thông báo thành công",
        });
      }

      return NextResponse.json({
        success: true,
        message: "Người dùng đã kích hoạt thông báo trước đó",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng đăng nhập để nhận được thông báo",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log("ERROR UPDATE TOKEN", error);
    return NextResponse.json(
      { success: false, message: "Lỗi cập nhật token thông báo" },
      { status: 500 }
    );
  }
}
