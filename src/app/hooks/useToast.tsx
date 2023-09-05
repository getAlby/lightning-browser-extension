import { ReactNode } from "react";
import { toast as hotToast } from "react-hot-toast";
import { useTheme } from "~/app/utils";

interface ToastMethods {
  success: (message: string) => void;
  error: (message: string) => void;
  custom: (children: ReactNode) => void;
}

export const useToast = () => {
  const theme = useTheme();

  const bgColor = theme === "light" ? "white" : "#1F1F1F";
  const textColor = theme === "light" ? "black" : "white";

  const toast: ToastMethods = {
    success: (message: string) => {
      hotToast.success(message, {
        style: { backgroundColor: bgColor, color: textColor },
      });
    },
    error: (message: string) => {
      hotToast.error(message, {
        style: { backgroundColor: bgColor, color: textColor },
      });
    },
    custom: (children: ReactNode) => {
      hotToast.custom((t) => <div>{children}</div>, {
        style: { backgroundColor: bgColor, color: textColor },
      });
    },
  };

  return toast;
};
