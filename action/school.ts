"use server";

import {
  CreateSchoolFormValues,
  CreateSchoolSchema,
  SchoolInformationFormValues,
  SchoolInformationSchema,
  UpdateSchoolGalleryFormValues,
  UpdateSchoolLocationFormValues,
  UpdateSchoolProgramFormValues,
  UpdateSchoolScholarshipFormValues,
} from "@/data/schemas/form-schema";
import { db } from "@/lib/db";
import admin from "firebase-admin";
import { SendGeneralNotifications } from "./notification";
import { UpdateSchoolScholarshipCover } from "@/components/forms/school/update/update-school-scholarship-cover";

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
        const { address, cover, isMain, name, description } = location;

        const newLocation = await db.schoolLocation.create({
          data: {
            address,
            cover,
            isMain,
            name,
            description,
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
        const { description, name, cover } = program;

        const newProgram = await db.schoolProgram.create({
          data: {
            description,
            cover,
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
          const { description, images, name, cover } = gallery;

          const newGallery = await db.schoolGallery.create({
            data: {
              description,
              cover,
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

export const UpdateSchoolLocations = async (
  id: string,
  values: UpdateSchoolLocationFormValues
) => {
  try {
    const existingSchool = await db.school.findUnique({
      where: {
        id,
      },
    });

    if (!existingSchool) {
      return { error: "Trường học không tồn tại" };
    }

    // Before delete check for exist students in the location
    const locations = await db.schoolLocation.findMany({
      where: {
        schoolId: id,
      },
      include: {
        students: true,
      },
    });

    const students = locations.map((location) => location.students);

    const isStudentExist = students.some((student) => student.length > 0);

    if (isStudentExist) {
      return { error: "Không thể xóa cơ sở đang có học sinh" };
    }

    await db.schoolLocation.deleteMany({
      where: {
        schoolId: id,
      },
    });

    await Promise.all(
      values.locations.map(async (location) => {
        const { address, cover, isMain, name, description } = location;

        const newLocation = await db.schoolLocation.create({
          data: {
            address,
            cover,
            isMain,
            name,
            description,
            schoolId: id,
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

    return { success: "Cập nhật cơ sở trường học thành công" };
  } catch (error) {
    console.log("UPDATE_SCHOOL_LOCATIONS_ACTION_ERROR", error);

    return { error: "Có lỗi xảy ra khi cập nhật cơ sở trường học" };
  }
};

export const UpdateSchoolPrograms = async (
  id: string,
  values: UpdateSchoolProgramFormValues
) => {
  try {
    const existingSchool = await db.school.findUnique({
      where: {
        id,
      },
    });

    if (!existingSchool) {
      return { error: "Trường học không tồn tại" };
    }

    // Before delete check for exist students in the program
    const programs = await db.schoolProgram.findMany({
      where: {
        schoolId: id,
      },
      include: {
        studentPrograms: true,
      },
    });

    const studentPrograms = programs.map((program) => program.studentPrograms);

    const isStudentExist = studentPrograms.some(
      (studentProgram) => studentProgram.length > 0
    );

    if (isStudentExist) {
      return { error: "Không thể xóa chương trình đào tạo đang có học sinh" };
    }

    await db.schoolProgram.deleteMany({
      where: {
        schoolId: id,
      },
    });

    await Promise.all(
      values.programs.map(async (program) => {
        const { cover, name, description } = program;

        const newProgram = await db.schoolProgram.create({
          data: {
            cover,
            name,
            description,
            schoolId: id,
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

    return { success: "Cập nhật chương trình đào tạo thành công" };
  } catch (error) {
    console.log("UPDATE_SCHOOL_PROGRAMS_ACTION_ERROR", error);

    return { error: "Có lỗi xảy ra khi cập nhật chương trình đào tạo" };
  }
};

export const UpdateSchoolGalleries = async (
  id: string,
  values: UpdateSchoolGalleryFormValues
) => {
  try {
    const existingSchool = await db.school.findUnique({
      where: {
        id,
      },
    });

    if (!existingSchool) {
      return { error: "Trường học không tồn tại" };
    }

    await db.schoolGallery.deleteMany({
      where: {
        schoolId: id,
      },
    });

    await Promise.all(
      values.galleries.map(async (gallery) => {
        const { cover, name, description } = gallery;

        const newGallery = await db.schoolGallery.create({
          data: {
            cover,
            name,
            description,
            schoolId: id,
          },
        });

        if (gallery.images)
          await Promise.all(
            gallery.images.map((image) => {
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

    return { success: "Cập nhật bộ sưu tập thành công" };
  } catch (error) {
    console.log("UPDATE_SCHOOL_GALLERIES_ACTION_ERROR", error);

    return { error: "Có lỗi xảy ra khi cập nhật bộ sưu tập" };
  }
};

export const UpdateSchoolScholarships = async (
  id: string,
  values: UpdateSchoolScholarshipFormValues
) => {
  try {
    const existingSchool = await db.school.findUnique({
      where: {
        id,
      },
    });

    if (!existingSchool) {
      return { error: "Trường học không tồn tại" };
    }

    // Before delete check for exist students in the scholarship
    const scholarships = await db.schoolScholarship.findMany({
      where: {
        schoolId: id,
      },
      include: {
        owners: true,
      },
    });

    const owners = scholarships.map((scholarship) => scholarship.owners);

    const isStudentExist = owners.some((owner) => owner.length > 0);

    if (isStudentExist) {
      return { error: "Không thể xóa học bổng đang có học sinh" };
    }

    await db.schoolScholarship.deleteMany({
      where: {
        schoolId: id,
      },
    });

    await Promise.all(
      values.scholarships.map(async (scholarship) => {
        const { cover, name, description } = scholarship;

        const newScholarship = await db.schoolScholarship.create({
          data: {
            cover,
            name,
            description,
            schoolId: id,
          },
        });

        if (scholarship.images)
          await Promise.all(
            scholarship.images.map((image) => {
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

    return { success: "Cập nhật học bổng thành công" };
  } catch (error) {
    console.log("UPDATE_SCHOOL_SCHOLARSHIPS_ACTION_ERROR", error);

    return { error: "Có lỗi xảy ra khi cập nhật học bổng" };
  }
};
