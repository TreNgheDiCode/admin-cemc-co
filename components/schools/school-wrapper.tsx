import { GetSchoolWrapper } from "@/data/schools";
import { redirect } from "next/navigation";
import { Navbar } from "../navbar";
import { cn } from "@/lib/utils";

type Props = {
  schoolId: string;
  children: React.ReactNode;
};

export const SchoolWrapper = async ({ schoolId, children }: Props) => {
  const school = await GetSchoolWrapper(schoolId);

  if (!school) {
    redirect("/schools");
  }

  return (
    <>
      <Navbar title={`Thông tin trường học`} description={school.name} />
      {!school.isPublished && (
        <div className="w-full h-16 bg-yellow-200 text-black flex items-center justify-center mt-20 mb-8">
          <p className="text-center">
            Trường học hiện đang ở ché độ{" "}
            <strong className="text-rose-500">TẠM ẨN</strong>. Vui lòng đổi chế
            độ để hiển thị trường.
          </p>
        </div>
      )}
      <div
        className={cn(
          "size-full [perspective:1000px] relative b flex flex-col mx-auto items-start justify-star",
          school.isPublished && "pt-20"
        )}
      >
        {children}
      </div>
    </>
  );
};
