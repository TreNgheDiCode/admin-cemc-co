import { UpdateSchoolProgram } from "@/components/forms/school/update/update-school-program";
import { Navbar } from "@/components/navbar";
import { UpdateSchoolProgramFormValues } from "@/data/schemas/form-schema";
import { GetSchoolPrograms } from "@/data/schools";

export const metadata = {
  title: "Cập nhật chương trình đào tạo | CANADA MEDICAL AND EDUCATION",
};

type Props = {
  params: {
    schoolId: string;
  };
};

const UpdateProgramsSchoolPage = async ({ params }: Props) => {
  const programs = await GetSchoolPrograms(params.schoolId);
  const initialData: UpdateSchoolProgramFormValues = {
    programs: programs.map((location) => ({
      ...location,
      description: location.description || "",
    })),
  };

  return (
    <>
      <Navbar title="Cập nhật cơ sở trường học" />
      <div className="pt-20">
        <UpdateSchoolProgram
          initialData={initialData}
          schoolId={params.schoolId}
        />
      </div>
    </>
  );
};

export default UpdateProgramsSchoolPage;
