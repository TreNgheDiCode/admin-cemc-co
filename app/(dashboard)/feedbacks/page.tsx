import { FeedbacksWrapper } from "@/components/feedbacks/feedbacks-wrapper";
import { Navbar } from "@/components/navbar";
import { GetFeedbacks } from "@/data/feedbacks";

const FeedbacksPage = async () => {
  const feedbacks = await GetFeedbacks();

  return (
    <>
      <Navbar title="Quản lý phản hồi" />
      <div className="pt-20">
        <FeedbacksWrapper feedbacks={feedbacks} />
      </div>
    </>
  );
};

export default FeedbacksPage;
