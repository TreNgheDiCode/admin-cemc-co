"use server";

import {
  CreateSchoolFormValues,
  CreateSchoolSchema,
  SchoolInformationFormValues,
  SchoolInformationSchema,
} from "@/data/form-schema";
import { db } from "@/lib/db";
import admin from "firebase-admin";
import { SendGeneralNotifications } from "./notification";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const CreateSchool = async (values: CreateSchoolFormValues) => {
  try {
    const validatedValues = CreateSchoolSchema.safeParse(values);

    if (!validatedValues.success) {
      console.log(
        "CREATE_SCHOOL_ACTION_VALIDATION_ERROR",
        validatedValues.error.errors
      );
      return { error: validatedValues.error.errors };
    }

    const { background, color, country, logo, name, short, ...data } =
      validatedValues.data;

    const existingSchool = await db.school.findUnique({
      where: {
        name,
      },
    });

    if (existingSchool) {
      return { error: "Trường học đã tồn tại trong hệ thống" };
    }

    // Check if there are 2 locations with the same name then return error
    const locationNames = data.locations.map((location) => location.name);

    if (new Set(locationNames).size !== locationNames.length) {
      return { error: "Tên các cơ sở không được trùng nhau" };
    }

    // Check if there are 2 locations with the same address then return error
    const locationAddresses = data.locations.map(
      (location) => location.address
    );

    if (new Set(locationAddresses).size !== locationAddresses.length) {
      return { error: "Địa chỉ các cơ sở không được trùng nhau" };
    }

    // Check if there are 2 programs with the same name then return error
    const programNames = data.programs.map((program) => program.name);

    if (new Set(programNames).size !== programNames.length) {
      return { error: "Tên các chương trình đào tạo không được trùng nhau" };
    }

    // Check if there are 2 gallery images with the same name then return error
    const galleryImages = data.galleries?.map((gallery) => gallery.name);

    if (galleryImages && new Set(galleryImages).size !== galleryImages.length) {
      return { error: "Tên các bộ sưu tập không được trùng nhau" };
    }

    // Check if there are 2 scholarships with the same name then return error
    const scholarshipNames = data.scholarships?.map(
      (scholarship) => scholarship.name
    );

    if (
      scholarshipNames &&
      new Set(scholarshipNames).size !== scholarshipNames.length
    ) {
      return { error: "Tên các học bổng không được trùng nhau" };
    }

    const school = await db.school.create({
      data: {
        background,
        color,
        country,
        logo,
        name,
        short,
      },
    });

    // Create school locations
    await Promise.all(
      data.locations.map(async (location) => {
        const { address, cover, isMain, name } = location;

        const newLocation = await db.schoolLocation.create({
          data: {
            address,
            cover,
            isMain,
            name,
            schoolId: school.id,
          },
        });

        if (location.images)
          await Promise.all(
            location.images.map((image) => {
              const newImage = db.schoolLocationImage.create({
                data: {
                  url: image,
                  locationId: newLocation.id,
                },
              });

              return newImage;
            })
          );

        if (location.contacts)
          await Promise.all(
            location.contacts.map((contact) => {
              const newContact = db.schoolLocationContact.create({
                data: {
                  ...contact,
                  locationId: newLocation.id,
                },
              });

              return newContact;
            })
          );
      })
    );

    // Create school programs
    await Promise.all(
      data.programs.map(async (program) => {
        const { description, name } = program;

        const newProgram = await db.schoolProgram.create({
          data: {
            description,
            name,
            schoolId: school.id,
          },
        });

        if (program.images)
          await Promise.all(
            program.images.map((image) => {
              const newImage = db.schoolProgramImage.create({
                data: {
                  url: image,
                  programId: newProgram.id,
                },
              });

              return newImage;
            })
          );
      })
    );

    // Create school galleries
    if (data.galleries)
      await Promise.all(
        data.galleries.map(async (gallery) => {
          const { description, images, name } = gallery;

          const newGallery = await db.schoolGallery.create({
            data: {
              description,
              name,
              schoolId: school.id,
            },
          });

          if (images)
            await Promise.all(
              images.map((image) => {
                db.schoolGalleryImage.create({
                  data: {
                    url: image,
                    galleryId: newGallery.id,
                  },
                });
              })
            );
        })
      );

    // Create school scholarships
    if (data.scholarships)
      await Promise.all(
        data.scholarships.map(async (scholarship) => {
          const { description, name, images, cover } = scholarship;

          const newScholarship = await db.schoolScholarship.create({
            data: {
              description,
              name,
              cover,
              schoolId: school.id,
            },
          });

          if (images)
            await Promise.all(
              images.map((image) => {
                db.schoolScholarshipImage.create({
                  data: {
                    url: image,
                    scholarshipId: newScholarship.id,
                  },
                });
              })
            );
        })
      );

    return { success: "Tạo trường học thành công", id: school.id };
  } catch (error) {
    console.log("CREATE_SCHOOL_ACTION_ERROR", error);

    return { error: "Có lỗi xảy ra khi tạo trường học" };
  }
};

export const UpdateSchoolInformation = async (
  id: string,
  values: SchoolInformationFormValues
) => {
  try {
    const validatedValues = SchoolInformationSchema.safeParse(values);

    if (!validatedValues.success) {
      console.log(
        "UPDATE_SCHOOL_INFORMATION_ACTION_VALIDATION_ERROR",
        validatedValues.error.errors
      );
      return { error: validatedValues.error.errors };
    }

    const existingSchool = await db.school.findUnique({
      where: {
        id,
      },
    });

    if (!existingSchool) {
      return { error: "Trường học không tồn tại" };
    }

    await db.school.update({
      where: {
        id,
      },
      data: {
        ...validatedValues.data,
      },
    });

    if (validatedValues.data.isPublished) {
      await SendGeneralNotifications(
        `${existingSchool.name}`,
        `Chào mừng ${existingSchool.name} gia nhập CEMC Co,. Ltd`,
        `/schools/${id}`
      );
    }

    return { success: "Cập nhật thông tin trường học thành công" };
  } catch (error) {
    console.log("UPDATE_SCHOOL_INFORMATION_ACTION_ERROR", error);

    return { error: "Có lỗi xảy ra khi cập nhật thông tin trường học" };
  }
};
