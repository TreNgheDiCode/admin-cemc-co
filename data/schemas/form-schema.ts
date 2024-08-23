import { Country, Gender, StudentStatus } from "@prisma/client";
import * as z from "zod";

export const SchoolInformationSchema = z.object({
  logo: z.string({
    required_error: "Logo không được để trống",
  }),
  background: z.string({
    required_error: "Màu nền không được để trống",
  }),
  name: z.string().min(3, {
    message: "Tên trường học phải có ít nhất 3 ký tự",
  }),
  short: z.optional(z.string()),
  color: z.string({
    required_error: "Màu trường không được để trống",
  }),
  isPublished: z.boolean(),
  country: z.enum([Country.AUSTRALIA, Country.CANADA, Country.KOREA]),
});
export type SchoolInformationFormValues = z.infer<
  typeof SchoolInformationSchema
>;

export const SchoolLocationContactSchema = z.object({
  phone: z.optional(z.string()),
  hours: z.optional(z.string()),
  fax: z.optional(z.string()),
  email: z.optional(z.string()),
  url: z.optional(z.string()),
});

export const SchoolLocationSchema = z.object({
  cover: z
    .string({
      required_error: "Ảnh bìa không được để trống",
    })
    .min(1, {
      message: "Ảnh bìa không được để trống",
    }),
  name: z.string().min(1, {
    message: "Tên cơ sở không được để trống",
  }),
  description: z.optional(z.string()),
  address: z.string().min(1, {
    message: "Địa chỉ cơ sở không được để trống",
  }),
  isMain: z.boolean(),
  images: z.optional(z.array(z.string())),
  contacts: z.optional(z.array(SchoolLocationContactSchema)),
});

export const UpdateSchoolLocationSchema = z.object({
  locations: z.array(SchoolLocationSchema).min(1, {
    message: "Phải có ít nhất một cơ sở",
  }),
});

export type UpdateSchoolLocationFormValues = z.infer<
  typeof UpdateSchoolLocationSchema
>;

export const SchoolProgramSchema = z.object({
  name: z.string().min(1, {
    message: "Tên chương trình đào tạo không được để trống",
  }),
  description: z.string().min(1, {
    message: "Mô tả chương trình đào tạo không được để trống",
  }),
  cover: z.string().min(1, {
    message: "Ảnh đại diện không được để trống",
  }),
  images: z.optional(z.array(z.string())),
});

export const UpdateSchoolProgramSchema = z.object({
  programs: z.array(SchoolProgramSchema).min(1, {
    message: "Phải có ít nhất một chương trình đào tạo",
  }),
});

export type UpdateSchoolProgramFormValues = z.infer<
  typeof UpdateSchoolProgramSchema
>;

export const SchoolGallerySchema = z.object({
  name: z.string().min(1, {
    message: "Tên bộ sưu tập không được để trống",
  }),
  cover: z.string().min(1, {
    message: "Ảnh đại diện không được để trống",
  }),
  description: z.string().min(1, {
    message: "Mô tả bộ sưu tập không được để trống",
  }),
  images: z.optional(z.array(z.string())),
});

export const UpdateSchoolGallerySchema = z.object({
  galleries: z.array(SchoolGallerySchema).min(1, {
    message: "Phải có ít nhất một bộ sưu tập",
  }),
});

export type UpdateSchoolGalleryFormValues = z.infer<
  typeof UpdateSchoolGallerySchema
>;

export const SchoolScholarshipSchema = z.object({
  name: z.string().min(1, {
    message: "Tên học bổng không được để trống",
  }),
  description: z.string().min(1, {
    message: "Mô tả học bổng không được để trống",
  }),
  cover: z.string().min(1, {
    message: "Ảnh đại diện không được để trống",
  }),
  images: z.optional(z.array(z.string())),
});

export const UpdateSchoolScholarshipSchema = z.object({
  scholarships: z.array(SchoolScholarshipSchema).min(1, {
    message: "Phải có ít nhất một học bổng",
  }),
});

export type UpdateSchoolScholarshipFormValues = z.infer<
  typeof UpdateSchoolScholarshipSchema
>;

// Create School Form
export const CreateSchoolSchema = z.object({
  logo: z.string({
    required_error: "Ảnh đại diện không được để trống",
  }),
  background: z.string({
    required_error: "Ảnh bìa không được để trống",
  }),
  name: z
    .string({
      required_error: "Tên trường học không được để trống",
    })
    .min(3, {
      message: "Tên trường học phải có ít nhất 3 ký tự",
    }),
  short: z.optional(z.string()),
  color: z.string({
    required_error: "Màu trường không được để trống",
  }),
  country: z.enum([Country.AUSTRALIA, Country.CANADA, Country.KOREA], {
    required_error: "Quốc gia không được để trống",
    invalid_type_error: "Quốc gia không hợp lệ",
  }),
  locations: z.array(SchoolLocationSchema).min(1, {
    message: "Phải có ít nhất một cơ sở",
  }),
  programs: z.array(SchoolProgramSchema).min(1, {
    message: "Phải có ít nhất một chương trình đào tạo",
  }),
  galleries: z.optional(z.array(SchoolGallerySchema)),
  scholarships: z.optional(z.array(SchoolScholarshipSchema)),
});

export type CreateSchoolFormValues = z.infer<typeof CreateSchoolSchema>;

export const ChatSupportSchema = z.object({
  userId: z.optional(z.string()),
  name: z.optional(z.string()),
  email: z.optional(z.string()),
  phone: z.optional(z.string()),
  clientId: z.optional(z.string()),
  message: z.string().min(1, {
    message: "Tin nhắn không được để trống",
  }),
});

export type ChatSupportFormValues = z.infer<typeof ChatSupportSchema>;

export const UpdateStudentSchema = z.object({
  isLocked: z.optional(z.boolean()),
  status: z.optional(
    z.enum([
      StudentStatus.APPROVED,
      StudentStatus.DROPPED,
      StudentStatus.STUDYING,
      StudentStatus.AWAITING,
    ])
  ),
  email: z.optional(
    z
      .string()
      .min(1, {
        message: "Email is required",
      })
      .email({
        message: "Invalid type of email",
      })
  ),
  name: z.optional(
    z.string().min(1, {
      message: "Fullname is required",
    })
  ),
  dob: z.optional(
    z
      .date({
        required_error: "Date of birth is required",
      })
      .min(new Date("1970-01-01"), {
        message: "Your age is too old",
      })
      .max(new Date("2006-31-12"), {
        message: "Your age is too young",
      })
  ),
  gender: z.optional(
    z.enum([Gender.MALE, Gender.FEMALE], {
      invalid_type_error: "Invalid type, please reselect",
    })
  ),
  phoneNumber: z.optional(
    z
      .string({
        invalid_type_error: "Invalid phone number",
        required_error: "Phone number is required",
      })
      .min(10, {
        message: "Minimum 10 numbers is required",
      })
      .max(13, {
        message: "Maximum 13 numbers is required",
      })
  ),
  idCardNumber: z.optional(
    z
      .string({
        required_error: "Id card number is required",
      })
      .min(1, {
        message: "Id card number is required",
      })
  ),
  city: z.optional(
    z.string().min(1, {
      message: "City is required",
    })
  ),
  district: z.optional(
    z.string().min(1, {
      message: "District is required",
    })
  ),
  ward: z.optional(
    z.string().min(1, {
      message: "Ward is required",
    })
  ),
  addressLine: z.optional(
    z.string().min(1, {
      message: "Address line is required",
    })
  ),
  additional: z.optional(z.string()),
});

export type UpdateStudentFormValues = z.infer<typeof UpdateStudentSchema>;
