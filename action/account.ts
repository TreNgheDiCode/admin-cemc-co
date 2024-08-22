"use server";

import { UpdateStudentSchema } from "@/data/schemas/form-schema";
import {
  UpdateAccountFormValues,
  UpdateAccountSchema,
} from "@/data/schemas/update-account-schema";
import { db } from "@/lib/db";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "@/lib/email";
import {
  generatePasswordResetToken,
  generateStudentCode,
  generateVerificationToken,
} from "@/lib/tokens";

export const acceptAccount = async (id: string) => {
  try {
    if (!id) {
      return { error: "Không tìm thấy tài khoản" };
    }

    const existAccount = await db.account.findUnique({
      where: {
        id,
      },
      include: {
        student: true,
      },
    });

    if (!existAccount) {
      return { error: "Không tìm thấy tài khoản" };
    }

    if (!existAccount.student) {
      return { error: "Tài khoản không phải là học sinh" };
    }

    const student = existAccount.student;

    if (!existAccount.emailVerified) {
      const verificationToken = await generateVerificationToken(
        existAccount.email
      );

      await sendVerificationEmail(
        existAccount.name,
        process.env.NODE_SENDER_EMAIL!,
        verificationToken.email,
        verificationToken.token
      );

      return {
        error:
          "Không thể duyệt tài khoản vì email chưa được xác thực, hãy kiểm tra email và xác thực trước khi duyệt",
      };
    }

    if (!student.studentCode && student.status === "AWAITING") {
      const studentCode = generateStudentCode(student.degreeType);

      const updatedStudent = await db.student.update({
        where: {
          id: student.id,
        },
        data: {
          studentCode,
          status: "APPROVED",
        },
        select: {
          account: {
            select: {
              email: true,
              name: true,
            },
          },
          studentCode: true,
          status: true,
        },
      });

      await db.profile.create({
        data: {
          studentId: student.id,
        },
      });

      await sendWelcomeEmail(
        updatedStudent.account.name,
        studentCode,
        updatedStudent.account.email
      );

      return { success: "Duyệt học sinh thành công" };
    }
  } catch (error) {
    console.log("ACCEPT ACCOUNT ACTION ERROR", error);

    return { error: "Có lỗi xảy ra, vui lòng thử lại sau" };
  }
};

export const rejectAccount = async (id: string, additional: string) => {
  try {
    if (!id) {
      return { error: "Không tìm thấy tài khoản" };
    }

    if (additional.length === 0) {
      return { error: "Vui lòng nhập lý do từ chối hồ sơ" };
    }

    const existAccount = await db.account.findUnique({
      where: {
        id,
      },
      include: {
        student: true,
      },
    });

    if (!existAccount) {
      return { error: "Không tìm thấy tài khoản" };
    }

    if (!existAccount.student) {
      return { error: "Tài khoản không phải là học sinh" };
    }

    const student = existAccount.student;

    if (student.status === "AWAITING" && !student.studentCode) {
      await db.student.update({
        where: {
          id: student.id,
        },
        data: {
          status: "DROPPED",
          additional,
        },
      });

      return { success: "Từ chối học sinh thành công" };
    }
  } catch (error) {
    console.log("REJECT ACCOUNT ACTION ERROR", error);

    return { error: "Có lỗi xảy ra, vui lòng thử lại sau" };
  }
};

export const sendPasswordReset = async (email: string, name: string) => {
  try {
    const passwordResetToken = await generatePasswordResetToken(email);

    await sendPasswordResetEmail(
      name,
      passwordResetToken.email,
      passwordResetToken.token
    );

    return { success: "Gửi yêu cầu khôi phục mật khẩu thành công" };
  } catch (error) {
    console.log("STUDENT RESET PASSWORD ACTION ERROR", error);

    return { error: "Gửi yêu cầu khôi phục mật khẩu thất bại" };
  }
};

export const sendEmailVerfication = async (email: string, name: string) => {
  try {
    const verificationToken = await generateVerificationToken(email);

    await sendVerificationEmail(
      name,
      process.env.NODE_SENDER_EMAIL!,
      verificationToken.email,
      verificationToken.token
    );

    return { success: "Gửi yêu cầu xác thực email thành công" };
  } catch (error) {
    console.log("STUDENT VERIFICATION EMAIL ACTION ERROR", error);

    return { error: "Gửi yêu cầu xác thực email thất bại" };
  }
};

export const updateAccount = async (
  id: string,
  values: UpdateAccountFormValues
) => {
  try {
    const validatedFields = UpdateAccountSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Trường dữ liệu không hợp lệ" };
    }

    const data = validatedFields.data;

    const existAccount = await db.account.findUnique({
      where: {
        id,
      },
      include: {
        student: true,
      },
    });

    if (!existAccount) {
      return { error: "Không tìm thấy tài khoản" };
    }

    if (!existAccount.student) {
      return { error: "Tài khoản không phải là học sinh" };
    }

    if (data.email && data.email !== existAccount.email) {
      const existEmail = await db.account.findFirst({
        where: {
          email: data.email,
        },
      });

      if (existEmail) {
        return { error: "Email đã tồn tại trong hệ thống" };
      }

      if (
        data.idCardNumber &&
        data.idCardNumber !== existAccount.idCardNumber
      ) {
        const existIdCard = await db.account.findFirst({
          where: {
            idCardNumber: data.idCardNumber,
          },
        });

        if (existIdCard) {
          return { error: "CMND/CCCD đã tồn tại trong hệ thống" };
        }
      }

      const address = `${data.addressLine}, ${data.ward}, ${data.district}, ${data.city}`;

      const updatedAccount = await db.account.update({
        where: {
          id,
        },
        data: {
          name: data.name,
          email: data.email,
          idCardNumber: data.idCardNumber,
          address,
          phoneNumber: data.phoneNumber,
          dob: data.dob,
        },
        select: {
          email: true,
          name: true,
        },
      });

      if (data.email === existAccount.email) {
        return { success: "Cập nhật thông tin học sinh thành công" };
      }

      const verificationToken = await generateVerificationToken(
        updatedAccount.email
      );

      await sendVerificationEmail(
        data.name!,
        process.env.NODE_SENDER_EMAIL!,
        verificationToken.email,
        verificationToken.token
      );

      return {
        success:
          "Cập nhật thông tin học sinh thành công, vui lòng xác thực email để mở khóa tính năng!",
      };
    }

    if (!existAccount.emailVerified) {
      const verificationToken = await generateVerificationToken(
        existAccount.email
      );

      await sendVerificationEmail(
        existAccount.name,
        process.env.NODE_SENDER_EMAIL!,
        verificationToken.email,
        verificationToken.token
      );

      return {
        error:
          "Tài khoản chưa xác thực email, vui lòng kiểm tra hộp thư để tiến hành xác thực",
      };
    }

    const address = `${data.addressLine}, ${data.ward}, ${data.district}, ${data.city}`;

    await db.account.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        email: data.email,
        idCardNumber: data.idCardNumber,
        address,
        phoneNumber: data.phoneNumber,
        dob: data.dob,
      },
      select: {
        email: true,
        name: true,
      },
    });

    return { success: "Cập nhật thông tin học sinh thành công" };
  } catch (error) {
    console.log("UPDATE ACCOUNT ACTION ERROR", error);

    return { error: "Có lỗi xảy ra, vui lòng thử lại sau" };
  }
};

export const lockAccount = async (id: string) => {
  try {
    if (!id) {
      return { error: "Không tìm thấy tài khoản" };
    }

    const existAccount = await db.account.findUnique({
      where: {
        id,
      },
    });

    if (!existAccount) {
      return { error: "Không tìm thấy tài khoản" };
    }

    await db.account.update({
      where: {
        id,
      },
      data: {
        isLocked: true,
      },
    });

    return { success: "Khóa tài khoản thành công" };
  } catch (error) {
    console.log("LOCK ACCOUNT ACTION ERROR", error);

    return { error: "Có lỗi xảy ra, vui lòng thử lại sau" };
  }
};

export const unlockAccount = async (id: string) => {
  try {
    if (!id) {
      return { error: "Không tìm thấy tài khoản" };
    }

    const existAccount = await db.account.findUnique({
      where: {
        id,
      },
    });

    if (!existAccount) {
      return { error: "Không tìm thấy tài khoản" };
    }

    await db.account.update({
      where: {
        id,
      },
      data: {
        isLocked: false,
      },
    });

    return { success: "Mở khóa tài khoản thành công" };
  } catch (error) {
    console.log("UNLOCK ACCOUNT ACTION ERROR", error);

    return { error: "Có lỗi xảy ra, vui lòng thử lại sau" };
  }
};
