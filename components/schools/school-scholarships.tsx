import { GetSchoolScholarships } from "@/data/schools";
import { SchoolScholarshipsList } from "./school-scholarships-list";

type Props = {
  schoolId: string;
};

export const SchoolScholarships = async ({ schoolId }: Props) => {
  const scholarships = await GetSchoolScholarships(schoolId);

  return (
    <SchoolScholarshipsList scholarships={scholarships} schoolId={schoolId} />
  );
};
