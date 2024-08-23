import { CreateSchoolFormValues } from "@/data/schemas/form-schema";
import { PreviewSchoolScholarshipsList } from "./preview-school-scholarships-list";

type Props = {
  scholarships: CreateSchoolFormValues["scholarships"];
};

export const PreviewSchoolScholarships = async ({ scholarships }: Props) => {
  return scholarships && scholarships.length > 0 ? (
    <PreviewSchoolScholarshipsList scholarships={scholarships} />
  ) : (
    <div className="text-main dark:text-main-foreground text-2xl">
      Danh sách học bổng trống
    </div>
  );
};
