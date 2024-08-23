import {
  CertificateType,
  Country,
  DegreeType,
  Gender,
  GradeType,
} from "@prisma/client";
import { z } from "zod";

export const RegisterSchema = z
  .object({
    image: z.optional(z.string()),
    email: z
      .string({
        required_error: "Vui lòng nhập email",
      })
      .min(1, {
        message: "Vui lòng nhập email",
      })
      .email({
        message: "Vui lòng nhập email hợp lệ",
      }),
    password: z
      .string({
        required_error: "Vui lòng nhập mật khẩu",
      })
      .min(1, {
        message: "Vui lòng nhập mật khẩu",
      }),
    confirmPassword: z
      .string({
        required_error: "Vui lòng xác nhận mật khẩu",
      })
      .min(1, {
        message: "Vui lòng xác nhận mật khẩu",
      }),
    name: z
      .string({
        required_error: "Vui lòng nhập họ và tên",
      })
      .min(1, {
        message: "Vui lòng nhập họ và tên",
      }),
    dob: z
      .date({
        required_error: "Vui lòng chọn ngày sinh",
      })
      .min(new Date("1970-01-01"), {
        message: "Tuổi của bạn quá lớn",
      })
      .max(new Date("2006-31-12"), {
        message: "Tuổi của bạn quá nhỏ",
      }),
    gender: z.enum([Gender.MALE, Gender.FEMALE], {
      invalid_type_error: "Giới tính không hợp lệ",
    }),
    phoneNumber: z
      .string({
        invalid_type_error: "Số điện thoại không hợp lệ",
        required_error: "Số điện thoại là bắt buộc",
      })
      .min(10, {
        message: "Vui lòng nhập ít nhất 10 số",
      })
      .max(13, {
        message: "Vui lòng nhập tối đa 13 số",
      }),
    idCardNumber: z
      .string({
        required_error: "CCCD/CMND là bắt buộc",
      })
      .min(1, {
        message: "Vui lòng nhập CCCD/CMND",
      }),
    country: z.enum([Country.AUSTRALIA, Country.CANADA, Country.KOREA], {
      message: "Vui lòng chọn quốc gia",
    }),

    city: z
      .string({
        required_error: "Vui lòng chọn thành phố",
      })
      .min(1, {
        message: "Vui lòng chọn thành phố",
      }),
    district: z
      .string({
        required_error: "Vui lòng chọn quận/huyện",
      })
      .min(1, {
        message: "Vui lòng chọn quận/huyện",
      }),
    ward: z
      .string({
        required_error: "Vui lòng chọn phường/xã",
      })
      .min(1, {
        message: "Vui lòng chọn phường/xã",
      }),
    addressLine: z
      .string({
        required_error: "Vui lòng nhập địa chỉ",
      })
      .min(1, {
        message: "Vui lòng nhập địa chỉ",
      }),
    schoolName: z
      .string({
        required_error: "Vui lòng chọn trường học",
      })
      .min(1, {
        message: "Vui lòng chọn trường học",
      }),
    programName: z
      .string({
        required_error: "Vui lòng chọn chương trình đào tạo",
      })
      .min(1, {
        message: "Vui lòng chọn chương trình đào tạo",
      }),

    degreeType: z.enum([DegreeType.HIGHSCHOOL, DegreeType.UNIVERSITY], {
      required_error: "Vui lòng chọn loại học vấn",
      invalid_type_error: "Loại học vấn không hợp lệ",
    }),
    certificateType: z.enum([CertificateType.IELTS, CertificateType.TOEFL], {
      required_error: "Vui lòng chọn loại chứng chỉ",
      invalid_type_error: "Loại chứng chỉ không hợp lệ",
    }),
    certificateImg: z
      .string({
        required_error: "Vui lòng chọn ảnh chứng chỉ",
      })
      .min(1, {
        message: "Vui lòng chọn ảnh chứng chỉ",
      }),
    gradeType: z.enum([GradeType.GPA, GradeType.CGPA], {
      required_error: "Vui lòng chọn thang điểm",
      invalid_type_error: "Thang điểm không hợp lệ",
    }),
    gradeScore: z
      .string({
        required_error: "Vui lòng nhập tổng điểm trung bình tích lũy",
      })
      .min(1, {
        message: "Vui lòng nhập tổng điểm trung bình tích lũy",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không trùng khớp",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.gradeType === GradeType.GPA) {
        if (data.gradeScore && parseInt(data.gradeScore) > 4) {
          return false;
        }

        if (data.gradeScore && parseInt(data.gradeScore) < 0) {
          return false;
        }

        return true;
      }

      if (data.gradeType === GradeType.CGPA) {
        if (data.gradeScore && parseInt(data.gradeScore) > 10) {
          return false;
        }

        if (data.gradeScore && parseInt(data.gradeScore) < 0) {
          return false;
        }

        return true;
      }
    },
    {
      message: "Điểm không hợp lệ với thang điểm",
      path: ["gradeScore"],
    }
  );

export type RegisterFormValues = z.infer<typeof RegisterSchema>;
