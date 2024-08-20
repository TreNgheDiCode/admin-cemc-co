"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { HoverBorderGradient } from "../ui/hover-border-gradient";

type Props = {
  title: string;
  value: string;
  content?: string | React.ReactNode | any;
  icon?: React.ReactNode | JSX.Element;
};

export const SchoolTabs = ({
  tabs: propTabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
}: {
  tabs: Props[];
  containerClassName?: string;
  activeTabClassName?: string;
  tabClassName?: string;
  contentClassName?: string;
}) => {
  const [active, setActive] = useState<Props>(propTabs[0]!);
  const [tabs, setTabs] = useState<Props[]>(propTabs);

  const moveSelectedTabToTop = (idx: number) => {
    const newTabs = [...propTabs];
    const selectedTab = newTabs.splice(idx, 1);
    newTabs.unshift(selectedTab[0]!);
    setTabs(newTabs);
    setActive(newTabs[0]!);
  };

  const [hovering, setHovering] = useState(false);

  return (
    <>
      <div
        className={cn(
          "flex flex-row items-center justify-center [perspective:1000px] relative overflow-auto sm:overflow-visible scrollbar-hide md:scrollbar-default max-w-full w-full gap-4",
          containerClassName
        )}
      >
        {propTabs.map((tab, idx) => (
          <HoverBorderGradient
            key={tab.title}
            onClick={() => {
              moveSelectedTabToTop(idx);
            }}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className={cn(
              "relative px-4 py-2 rounded-full dark:bg-main-component bg-neutral-100",
              tabClassName
            )}
            style={{
              transformStyle: "preserve-3d",
            }}
            as="button"
          >
            {active.value === tab.value && (
              <motion.div
                layoutId="clickedbutton"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                className={cn(
                  "absolute flex items-center justify-center md:block inset-0 bg-main dark:bg-main-foreground rounded-full",
                  activeTabClassName
                )}
              >
                <div className="md:hidden !text-white dark:!text-main-background">
                  {tab.icon}
                </div>
              </motion.div>
            )}

            <span
              className={cn(
                "relative hidden md:block text-main-component dark:text-main-foreground font-medium",
                active.value === tab.value &&
                  "!text-white dark:!text-main-background"
              )}
            >
              {tab.title}
            </span>
            <span
              className={cn(
                "flex items-center justify-center size-6 md:hidden text-main-component dark:text-main-foreground font-medium",
                active.value === tab.value &&
                  "!text-white dark:!text-main-background"
              )}
            >
              {tab.icon}
            </span>
          </HoverBorderGradient>
        ))}
      </div>
      <FadeInDiv
        tabs={tabs}
        active={active}
        key={active.value}
        hovering={hovering}
        className={cn("mt-8", contentClassName)}
      />
    </>
  );
};

export const FadeInDiv = ({
  className,
  tabs,
  hovering,
}: {
  className?: string;
  key?: string;
  tabs: Props[];
  active: Props;
  hovering?: boolean;
}) => {
  const isActive = (tab: Props) => {
    return tab.value === tabs[0]!.value;
  };
  return (
    <div className="relative w-full h-full">
      {tabs.map((tab, idx) => (
        <motion.div
          key={tab.value}
          layoutId={tab.value}
          style={{
            scale: 1 - idx * 0.1,
            top: hovering ? idx * -40 : 0,
            zIndex: -idx,
            opacity: idx < 3 ? 1 - idx * 0.1 : 0,
          }}
          animate={{
            y: isActive(tab) ? [0, 40, 0] : 0,
          }}
          className={cn("w-full h-full absolute top-0 left-0", className)}
        >
          {tab.content}
        </motion.div>
      ))}
    </div>
  );
};
