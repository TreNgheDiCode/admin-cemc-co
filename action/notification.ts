"use server";

import { db } from "@/lib/db";
import admin from "firebase-admin";
import { Message } from "firebase-admin/messaging";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const UpsertNotificationToken = async (
  token: string,
  userId: string
) => {
  try {
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
    }

    return {
      success:
        "Cập nhật mã token thông báo thành công. Bắt đầu nhận thông báo!",
    };
  } catch (error) {
    console.error("Error upserting notification token", error);

    return { error: "Có lỗi xảy ra khi cập nhật token thông báo" };
  }
};

// Gửi thông báo đến tất cả người dùng
export const SendGeneralNotifications = async (
  title: string,
  body: string,
  link?: string
) => {
  try {
    const tokens = await db.notificationToken.findMany({
      select: {
        token: true,
        userId: true,
      },
    });

    await Promise.all(
      tokens.map((token) => {
        const payload: Message = {
          token: token.token,
          notification: {
            title,
            body,
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
          webpush: {
            fcmOptions: {
              link,
            },
          },
        };

        admin.messaging().send(payload);
      })
    );

    await db.notificationPush.createMany({
      data: tokens.map((token) => ({
        receiverId: token.userId,
        title,
        body,
        type: "ANNOUNCEMENT",
        senderName: "CEMC Co,. Ltd",
      })),
    });
    return { success: "Gửi thông báo thành công" };
  } catch (error) {
    console.error("Error sending notification", error);

    return { error: "Có lỗi xảy ra khi gửi thông báo" };
  }
};

export const GetNotificationsPush = async (userId: string) => {
  try {
    const notifications = await db.notificationPush.findMany({
      where: {
        receiverId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { notifications };
  } catch (error) {
    console.error("Error fetching notifications", error);

    return { error: "Có lỗi xảy ra khi lấy thông báo" };
  }
};

export const MarkNotificationAsRead = async (notificationId: string) => {
  try {
    await db.notificationPush.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });

    return { success: "Đánh dấu thông báo thành công" };
  } catch (error) {
    console.error("Error marking notification as read", error);

    return { error: "Có lỗi xảy ra khi đánh dấu thông báo" };
  }
};
