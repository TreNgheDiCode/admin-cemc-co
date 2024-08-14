import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <>
      <Navbar title={`Bảng điều khiển`} />
      <main className="py-20 px-10 text-main dark:text-main-foreground"></main>
    </>
  );
}
