"use client";

import { PreviewSchoolProgramsList } from "./preview-school-programs-list";
import { CreateSchoolFormValues } from "@/data/schemas/form-schema";

type Props = {
  programs: CreateSchoolFormValues["programs"];
};

export const PreviewSchoolPrograms = ({ programs }: Props) => {
  return programs.length > 0 ? (
    <PreviewSchoolProgramsList programs={programs} />
  ) : (
    <div className="text-main dark:text-main-foreground text-2xl">
      Danh sách chương trình đào tạo trống
    </div>
  );
};
