import { ReactNode } from "react";
import { ToastOptions, toast as hotToast } from "react-hot-toast";

interface ToastMethods {
  success: (message: string) => void;
  error: (message: string) => void;
  custom: (children: ReactNode, options?: ToastOptions) => void;
}

const toast: ToastMethods = {
  success: (message: string) => {
    toast.custom(message);
  },
  error: (message: string) => {
    toast.custom(<>test</>);
  },
  custom: (children: ReactNode, options?: ToastOptions) => {
    hotToast.custom(
      (t: ToastOptions) => (
        <span className="bg-red-500 dark:bg-green-500">
          Custom and <b>bold</b>
          {children}
          <button onClick={() => hotToast.dismiss(t.id)}>Dismiss</button>
        </span>
      ),
      options
    );
  },
};

export default toast;
