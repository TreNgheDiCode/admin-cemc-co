import { UpdateSchoolGallery } from "@/components/forms/school/update/update-school-gallery";
import { UpdateSchoolScholarship } from "@/components/forms/school/update/update-school-scholarship";
import { Navbar } from "@/components/navbar";
import { UpdateSchoolScholarshipFormValues } from "@/data/schemas/form-schema";
import { GetSchoolScholarships } from "@/data/schools";

export const metadata = {
  title: "Cập nhật học bổng | CANADA MEDICAL AND EDUCATION",
};

type Props = {
  params: {
    schoolId: string;
  };
};

const UpdateScholarshipsSchoolPage = async ({ params }: Props) => {
  const scholarships = await GetSchoolScholarships(params.schoolId);
  const initialData: UpdateSchoolScholarshipFormValues = {
    scholarships: scholarships.map((scholarship) => ({
      ...scholarship,
      description: scholarship.description || "",
      images: scholarship.images.map((image) => image.url),
    })),
  };

  return (
    <>
      <Navbar title="Cập nhật bộ sưu tập" />
      <div className="pt-20">
        <UpdateSchoolScholarship
          initialData={initialData}
          schoolId={params.schoolId}
        />
      </div>
    </>
  );
};

export default UpdateScholarshipsSchoolPage;
