import { useEffect } from "react";
import api from "../../common/lib/api";

export function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

export function useThemeEffect(dependencies: undefined | string) {
  useEffect(() => {
    api.getSettings().then((response) => {
      const settings = response;
      if (settings.theme === "system") {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else if (settings.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (settings.theme === "light") {
        document.documentElement.classList.remove("dark");
      }
    });
  }, [dependencies]);
}
