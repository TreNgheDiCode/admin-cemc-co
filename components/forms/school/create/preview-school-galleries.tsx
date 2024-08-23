import { CreateSchoolFormValues } from "@/data/schemas/form-schema";
import { PreviewSchoolGalleriesList } from "./preview-school-galleries-list";

type Props = {
  galleries: CreateSchoolFormValues["galleries"];
};

export const PreviewSchoolGalleries = async ({ galleries }: Props) => {
  return galleries && galleries.length > 0 ? (
    <PreviewSchoolGalleriesList galleries={galleries} />
  ) : (
    <div className="text-main dark:text-main-foreground text-2xl">
      Danh sách bộ sưu tập trống
    </div>
  );
};
