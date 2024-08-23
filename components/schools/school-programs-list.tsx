"use client";

import { useOutsideClick } from "@/hooks/use-outside-click";
import { cn } from "@/lib/utils";
import { SchoolProgramLib } from "@/types/school";
import { AnimatePresence, motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";

type Props = {
  programs: SchoolProgramLib[];
  schoolId: string;
};

export const SchoolProgramsList = ({ programs, schoolId }: Props) => {
  const router = useRouter();
  const [active, setActive] = useState<
    (typeof programs)[number] | boolean | null
  >(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0  grid place-items-center z-[100]">
            <motion.div
              layoutId={`program-${active.name}-${active.id}`}
              ref={ref}
              className="w-full max-w-[500px]  h-full md:h-fit md:max-h-[90%]  flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`cover-${active.name}-${active.id}`}>
                <Image
                  priority
                  quality={100}
                  width={793}
                  height={417}
                  src={active.cover ?? "/logo_light.png"}
                  alt={active.name}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                />
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div className="">
                    <motion.h3
                      layoutId={`name-${active.name}-${active.id}`}
                      className="font-medium text-neutral-700 dark:text-neutral-200 text-base"
                    >
                      {active.name}
                    </motion.h3>
                    <motion.div
                      layoutId={`isPublished-${active.isPublished}-${active.id}`}
                      className="text-neutral-600 dark:text-neutral-400 text-base"
                    >
                      <Badge
                        className={cn(
                          "text-main-component font-medium text-sm",
                          active.isPublished
                            ? "bg-emerald-300"
                            : "bg-yellow-300"
                        )}
                      >
                        {active.isPublished ? "Hiển thị" : "Tạm ẩn"}
                      </Badge>
                    </motion.div>
                    <motion.div
                      layoutId={`_count.studentPrograms-${active._count.studentPrograms}-${active.id}`}
                      className="text-neutral-600 dark:text-neutral-400 text-base"
                    >
                      {active._count.studentPrograms} học sinh
                    </motion.div>
                  </div>

                  <motion.a
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    href={`/schools/${schoolId}/program/${active.id}`}
                    target="_blank"
                    className="px-4 py-3 text-sm rounded-full font-bold bg-main hover:dark:bg-main-component/70 dark:bg-main-component hover:bg-main/70 text-white dark:text-main-foreground whitespace-nowrap"
                  >
                    Xem chi tiết
                  </motion.a>
                </div>
                <div className="pt-4 relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {active.description}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className="max-w-3xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 items-start gap-4">
        {programs.map((program) => (
          <motion.div
            layoutId={`program-${program.name}-${program.id}`}
            key={program.name}
            onClick={() => setActive(program)}
            className="p-4 flex flex-col  hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
          >
            <div className="flex gap-4 flex-col w-full">
              <motion.div layoutId={`cover-${program.name}-${program.id}`}>
                <Image
                  width={793}
                  height={417}
                  priority
                  quality={100}
                  src={program.cover ?? "/logo_light.png"}
                  alt={program.name}
                  className="h-60 w-full  rounded-lg object-cover object-top"
                />
              </motion.div>
              <div className="flex justify-center items-center flex-col">
                <motion.h3
                  layoutId={`name-${program.name}-${program.id}`}
                  className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left text-base"
                >
                  {program.name}
                </motion.h3>
                <motion.div
                  layoutId={`isPublished-${program.isPublished}-${program.id}`}
                  className="text-neutral-600 dark:text-neutral-400 text-center md:text-left text-base"
                >
                  <Badge
                    className={cn(
                      "text-main-component font-medium text-sm",
                      program.isPublished ? "bg-emerald-300" : "bg-yellow-300"
                    )}
                  >
                    {program.isPublished ? "Hiển thị" : "Tạm ẩn"}
                  </Badge>
                </motion.div>
                <motion.div
                  layoutId={`_count.studentPrograms-${program._count.studentPrograms}-${program.id}`}
                  className="text-neutral-600 dark:text-neutral-400 text-base"
                >
                  {program._count.studentPrograms} học sinh
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
        <div className="size-full flex items-center justify-center">
          <button 
            onClick={() => router.push(`/schools/${schoolId}/programs`)}
          className="shadow-[0_0_0_3px_#7d1f1f_inset] dark:shadow-[0_0_0_3px_#f5f5f5_inset] px-6 py-2 bg-transparent border border-main dark:border-main-foreground dark:text-main-foreground text-main rounded-2xl font-bold transform hover:-translate-y-1 transition duration-400 text-xl flex items-center">
            <PlusCircle className="size-6 mr-2" />
            Thêm chương trình đào tạo
          </button>
        </div>
      </ul>
    </>
  );
};
