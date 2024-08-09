"use server";

import { db } from "@/lib/db";

export const reply = async (
  feedbackId: string,
  message: string,
  senderName: string,
  logo?: string
) => {
  try {
    if (message === "") {
      return {
        error: "Nội dung không được để trống",
      };
    }

    const feedback = await db.feedback.findUnique({
      where: {
        id: feedbackId,
      },
    });

    if (!feedback) {
      return {
        error: "Không tìm thấy phản hồi",
      };
    }

    if (!senderName || senderName === "") {
      return {
        error: "Tên người gửi không được để trống",
      };
    }

    const reply = await db.feedbackReply.create({
      data: {
        senderName,
        logo,
        role: "ADMIN",
        message,
        feedbackId,
      },
    });

    return { success: "Trả lời phản hồi thành công", data: reply };
  } catch (error) {
    console.log("ERROR REPLY FEEDBACK", error);

    return {
      error: "Có lỗi xảy ra khi trả lời phản hồi",
    };
  }
};

export const MarkAsRead = async (feedbackId: string) => {
  try {
    const feedback = await db.feedback.update({
      where: {
        id: feedbackId,
      },
      data: {
        isRead: true,
      },
    });

    return { success: "Đánh dấu đã đọc thành công", data: feedback };
  } catch (error) {
    console.log("ERROR MARK AS READ", error);

    return {
      error: "Có lỗi xảy ra khi đánh dấu đã đọc",
    };
  }
};

export const MarkAsUnread = async (feedbackId: string) => {
  try {
    const feedback = await db.feedback.update({
      where: {
        id: feedbackId,
      },
      data: {
        isRead: false,
      },
    });

    return { success: "Đánh dấu chưa đọc thành công", data: feedback };
  } catch (error) {
    console.log("ERROR MARK AS UNREAD", error);

    return {
      error: "Có lỗi xảy ra khi đánh dấu chưa đọc",
    };
  }
};

export const MarkAsSpam = async (feedbackId: string) => {
  try {
    const feedback = await db.feedback.update({
      where: {
        id: feedbackId,
      },
      data: {
        isSpam: true,
      },
    });

    return { success: "Đánh dấu spam thành công", data: feedback };
  } catch (error) {
    console.log("ERROR MARK AS SPAM", error);

    return {
      error: "Có lỗi xảy ra khi đánh dấu spam",
    };
  }
}

export const MarkAsNotSpam = async (feedbackId: string) => {
  try {
    const feedback = await db.feedback.update({
      where: {
        id: feedbackId,
      },
      data: {
        isSpam: false,
      },
    });

    return { success: "Đánh dấu không phải spam thành công", data: feedback };
  } catch (error) {
    console.log("ERROR MARK AS NOT SPAM", error);

    return {
      error: "Có lỗi xảy ra khi đánh dấu không phải spam",
    };
  }
}

export const MarkAsResolved = async (feedbackId: string) => {
  try {
    const feedback = await db.feedback.update({
      where: {
        id: feedbackId,
      },
      data: {
        isResolved: true,
      },
    });

    return { success: "Đánh dấu đã giải quyết thành công", data: feedback };
  } catch (error) {
    console.log("ERROR MARK AS RESOLVED", error);

    return {
      error: "Có lỗi xảy ra khi đánh dấu đã giải quyết",
    };
  }
}