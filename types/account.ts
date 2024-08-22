import { Gender, StudentStatus } from "@prisma/client";

export type AccountLib = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  dob: Date;
  gender: Gender;
  emailVerified: Date | null;
  phoneNumber: string;
  address: string;
  createdAt: Date;
  idCardNumber: string;
  isTwoFactorEnabled: boolean;
  student: {
    id: string;
    studentCode: string | null;
    status: StudentStatus;
  } | null;
  isLocked: boolean;
};
