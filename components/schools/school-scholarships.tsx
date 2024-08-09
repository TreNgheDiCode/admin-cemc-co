import { GetSchoolScholarships } from "@/data/schools";
import { SchoolScholarshipsList } from "./school-scholarships-list";

type Props = {
  schoolId: string;
};

export const SchoolScholarships = async ({ schoolId }: Props) => {
  const scholarships = await GetSchoolScholarships(schoolId);

  return scholarships.length > 0 ? (
    <SchoolScholarshipsList scholarships={scholarships} schoolId={schoolId} />
  ) : (
    <div className="text-main dark:text-main-foreground text-2xl">
      Danh sách học bổng trống
    </div>
  );
};
