import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GetSchoolStudents } from "@/data/schools";
import { StudentsSchoolDataTable } from "./student-school-data-table";

export const StudentSchoolTable = async ({
  schoolId,
}: {
  schoolId: string;
}) => {
  const students = await GetSchoolStudents(schoolId);

  if (!students || students.length === 0) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Danh sách học sinh trống
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Heading
        className="text-4xl"
        title={`Học sinh (Số lượng: ${students.length})`}
      />
      <StudentsSchoolDataTable students={students} />
    </div>
  );
};
