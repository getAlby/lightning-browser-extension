import { useLayoutEffect, createContext, useContext } from "react";

import api from "../../common/lib/api";

interface ThemeContextType {
  /**
   * Get the active theme and apply corresponding Tailwind classes to the document.
   */
  getTheme: () => void;
}

const ThemeContext = createContext({} as ThemeContextType);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  function getTheme() {
    api.getSettings().then((settings) => {
      // check if settings theme selection is system (this is the default)
      if (settings.theme === "system") {
        // checks if the users prefers dark mode and if true then adds dark class to HTML element
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark");
        }
        // if false removes dark class - there is no class by default but this is in case the user switches between themes
        else {
          document.documentElement.classList.remove("dark");
        }
      }
      // last two conditionals for if user selects light or dark mode
      else if (settings.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (settings.theme === "light") {
        document.documentElement.classList.remove("dark");
      }
    });
  }

  useLayoutEffect(() => {
    getTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ getTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
