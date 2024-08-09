import { GetSchoolPrograms } from "@/data/schools";
import { SchoolProgramsList } from "./school-programs-list";

type Props = {
  schoolId: string;
};

export const SchoolPrograms = async ({ schoolId }: Props) => {
  const programs = await GetSchoolPrograms(schoolId);

  return programs.length > 0 ? (
    <SchoolProgramsList programs={programs} schoolId={schoolId} />
  ) : (
    <div className="text-main dark:text-main-foreground text-2xl">
      Danh sách chương trình đào tạo trống
    </div>
  );
};
