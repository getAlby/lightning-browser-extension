import { Transition } from "@headlessui/react";
import { PopiconsXLine } from "@popicons/react";
import { ReactNode } from "react";
import {
  CheckmarkIcon,
  ErrorIcon,
  ToastOptions,
  toast as hotToast,
} from "react-hot-toast";

type ToastType = "error" | "success";

interface ToastMethods {
  success: (message: string | ReactNode, options?: ToastOptions) => void;
  error: (message: string | ReactNode, options?: ToastOptions) => void;
  custom: (
    children: ReactNode,
    type: ToastType,
    options?: ToastOptions
  ) => void;
}

const toast: ToastMethods = {
  success: (message: string | ReactNode, options?: ToastOptions) => {
    toast.custom(message, "success", options);
  },
  error: (message: string | ReactNode, options?: ToastOptions) => {
    toast.custom(message, "error", { duration: options?.duration ?? 8_000 });
  },
  custom: (children: ReactNode, type: ToastType, options?: ToastOptions) => {
    hotToast.custom(
      (t: { visible: boolean; id: string }) => (
        <Transition
          enter="transform transition duration-[400ms]"
          enterFrom="opacity-0 scale-0"
          enterTo="opacity-100 scale-1"
          leave="transform duration-200 transition ease-in-out"
          leaveFrom="opacity-100 scale-1"
          leaveTo="opacity-0 scale-0"
          show={t.visible}
        >
          <div className="bg-white dark:bg-surface-02dp px-4 py-3 drop-shadow-lg rounded-lg overflow-hidden flex flex-row items-center gap-3 text-gray-800 dark:text-neutral-200 max-w-sm sm:max-w-lg w-full break-words">
            <div className="shrink-0">
              {type == "success" && <CheckmarkIcon />}
              {type == "error" && <ErrorIcon />}
            </div>
            <div className="flex-1 text-sm max-h-[200px] overflow-auto">
              {children}
            </div>
            {/* Add close icons for toasts that are displayed for a longer time or with longer length*/}
            {(options?.duration && options?.duration > 10_000) ||
            (typeof children === "string" && children.length > 50) ? (
              <div className="absolute right-2 top-2 text-gray-600 cursor-button dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300">
                <PopiconsXLine
                  className="w-5 h-5"
                  onClick={() => hotToast.dismiss(t.id)}
                />
              </div>
            ) : null}
          </div>
        </Transition>
      ),
      options
    );
  },
};

export default toast;
