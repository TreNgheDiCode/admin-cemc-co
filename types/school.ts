import {
  Gender,
  News,
  School,
  SchoolGallery,
  SchoolGalleryImage,
  SchoolLocation,
  SchoolLocationContact,
  SchoolLocationImage,
  SchoolProgram,
  SchoolScholarship,
  SchoolScholarshipImage,
  Student,
} from "@prisma/client";
import { AccelerateInfo } from "@prisma/extension-accelerate";

export type SchoolScholarshipLib = SchoolScholarship & {
  images: SchoolScholarshipImage[];
  _count: {
    owners: number;
  };
};

export type SchoolGalleryLib = SchoolGallery & {
  images: SchoolGalleryImage[];
};

export type SchoolProgramLib = SchoolProgram & {
  _count: {
    studentPrograms: number;
  };
};

export type SchoolLocationLib = SchoolLocation & {
  contacts: SchoolLocationContact[];
  images: SchoolLocationImage[];
};

export type SchoolStudent = Student & {
  account: {
    name: string;
    image: string | null;
    email: string;
    phoneNumber: string;
    dob: Date;
    gender: Gender;
    address: string;
  };
};

export type SchoolData = (School & {
  news: News[];
  galleries: (SchoolGallery & {
    images: SchoolGalleryImage[];
  })[];
  locations: (SchoolLocation & {
    contacts: SchoolLocationContact[];
    images: SchoolLocationImage[];
  })[];
  programs: (SchoolProgram & {
    studentPrograms: {
      student: {
        id: string;
        studentCode: string | null;
        account: {
          name: string;
        };
        cover: string | null;
        degreeType: string;
        certificateType: string;
        gradeType: string;
        gradeScore: number;
        status: string;
      };
    }[];
  })[];
  scholarships: (SchoolScholarship & {
    images: SchoolScholarshipImage[];
    owners: {
      student: Student;
    }[];
  })[];
})[];

export type SchoolLib = {
  data: SchoolData;
  info: AccelerateInfo | null;
};
