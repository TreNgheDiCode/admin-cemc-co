"use client";

import { useOutsideClick } from "@/hooks/use-outside-click";
import { SchoolLocation } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

type Props = {
  locations: SchoolLocation[];
  schoolId: string;
};

export const SchoolLocationsList = ({ locations, schoolId }: Props) => {
  const [active, setActive] = useState<
    (typeof locations)[number] | boolean | null
  >(null);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
              layoutId={`location-${active.name}-${id}`}
              ref={ref}
              className="w-full max-w-[500px]  h-full md:h-fit md:max-h-[90%]  flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`cover-${active.name}-${id}`}>
                <Image
                  priority
                  quality={100}
                  width={793}
                  height={417}
                  src={active.cover}
                  alt={active.name}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                />
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div className="">
                    <motion.h3
                      layoutId={`name-${active.name}-${id}`}
                      className="font-medium text-neutral-700 dark:text-neutral-200 text-base"
                    >
                      {active.name}
                    </motion.h3>
                    <motion.p
                      layoutId={`address-${active.address}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400 text-base"
                    >
                      {active.address}
                    </motion.p>
                  </div>

                  <motion.a
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    href={`/schools/${schoolId}/location/${active.id}`}
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
        {locations.map((location) => (
          <motion.div
            layoutId={`location-${location.name}-${id}`}
            key={location.name}
            onClick={() => setActive(location)}
            className="p-4 flex flex-col  hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
          >
            <div className="flex gap-4 flex-col  w-full">
              <motion.div layoutId={`cover-${location.name}-${id}`}>
                <Image
                  width={793}
                  height={417}
                  priority
                  quality={100}
                  src={location.cover}
                  alt={location.name}
                  className="h-60 w-full  rounded-lg object-cover object-top"
                />
              </motion.div>
              <div className="flex justify-center items-center flex-col">
                <motion.h3
                  layoutId={`name-${location.name}-${id}`}
                  className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left text-base"
                >
                  {location.name}
                </motion.h3>
                <motion.p
                  layoutId={`address-${location.address}-${id}`}
                  className="text-neutral-600 dark:text-neutral-400 text-center md:text-left text-base"
                >
                  {location.address}
                </motion.p>
              </div>
            </div>
          </motion.div>
        ))}
        <div className="size-full flex items-center justify-center">
          <button
            onClick={() => router.push(`/schools/${schoolId}/locations`)}
            className="shadow-[0_0_0_3px_#7d1f1f_inset] dark:shadow-[0_0_0_3px_#f5f5f5_inset] px-6 py-2 bg-transparent border border-main dark:border-main-foreground dark:text-main-foreground text-main rounded-2xl font-bold transform hover:-translate-y-1 transition duration-400 text-xl flex items-center"
          >
            <PlusCircle className="size-6 mr-2" />
            Thêm cơ sở
          </button>
        </div>
      </ul>
    </>
  );
};
