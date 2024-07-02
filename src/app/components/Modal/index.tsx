import { PopiconsXLine } from "@popicons/react";
import ReactModal from "react-modal";
import { classNames } from "~/app/utils";

type Props = {
  children?: React.ReactNode;
  isOpen: boolean;
  close: () => void;
  contentLabel: string;
  title?: string;
  position?: "top" | "center";
};

export default function Modal({
  children,
  isOpen,
  close: closeModal,
  contentLabel,
  title,
  position = "center",
}: Props) {
  return (
    <ReactModal
      ariaHideApp={false}
      closeTimeoutMS={200}
      shouldFocusAfterRender={false}
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel={contentLabel}
      overlayClassName={classNames(
        "bg-black bg-opacity-50 fixed inset-0 flex justify-center cursor-pointer",
        position == "center" && "items-center",
        position == "top" && "items-start pt-20"
      )}
      className="rounded-lg shadow-xl bg-white dark:bg-surface-01dp w-full max-w-md overflow-x-hidden relative p-5 cursor-auto mx-5 no-scrollbar"
      style={{ content: { maxHeight: "80vh" } }}
    >
      {title && (
        <h2 className="text-2xl font-bold dark:text-white pb-5">{title}</h2>
      )}
      <button
        onClick={closeModal}
        className="absolute right-5 top-5 text-gray-600 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300"
      >
        <PopiconsXLine className="w-6 h-6" />
      </button>
      {children}
    </ReactModal>
  );
}
