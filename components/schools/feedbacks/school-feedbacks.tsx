import { GetSchoolFeedbacks } from "@/data/schools";
import { SchoolFeedbacksWrapper } from "./school-feedbacks-wrapper";

type Props = {
  schoolId: string;
};

export const SchoolFeedbacks = async ({ schoolId }: Props) => {
  const feedbacks = await GetSchoolFeedbacks(schoolId);

  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="items-center justify-center text-2xl">
        Danh sách phản hồi trống
      </div>
    );
  }

  return <SchoolFeedbacksWrapper feedbacks={feedbacks} />;
};
