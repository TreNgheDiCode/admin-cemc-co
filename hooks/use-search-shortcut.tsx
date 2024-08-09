"use client";

import { useEffect } from "react";

const useCtrlKShortcut = (callback: () => void) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if CTRL (or CMD on Mac) + K is pressed
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        callback();
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [callback]);
};

export default useCtrlKShortcut;
