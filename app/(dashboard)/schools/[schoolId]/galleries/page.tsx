import { UpdateSchoolGallery } from "@/components/forms/school/update/update-school-gallery";
import { Navbar } from "@/components/navbar";
import { UpdateSchoolGalleryFormValues } from "@/data/schemas/form-schema";
import { GetSchoolGalleries } from "@/data/schools";

export const metadata = {
  title: "Cập nhật bộ sưu tập | CANADA MEDICAL AND EDUCATION",
};

type Props = {
  params: {
    schoolId: string;
  };
};

const UpdateGalleriesSchoolPage = async ({ params }: Props) => {
  const galleries = await GetSchoolGalleries(params.schoolId);
  const initialData: UpdateSchoolGalleryFormValues = {
    galleries: galleries.map((gallery) => ({
      ...gallery,
      description: gallery.description || "",
      images: gallery.images.map((image) => image.url),
    })),
  };

  return (
    <>
      <Navbar title="Cập nhật bộ sưu tập" />
      <div className="pt-20">
        <UpdateSchoolGallery
          initialData={initialData}
          schoolId={params.schoolId}
        />
      </div>
    </>
  );
};

export default UpdateGalleriesSchoolPage;
