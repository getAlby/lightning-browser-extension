import { CrossIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import ReactModal from "react-modal";

type Props = {
  children?: React.ReactNode;
  isOpen: boolean;
  close: () => void;
  contentLabel: string;
  title?: string;
};

export default function Modal({
  children,
  isOpen,
  close: closeModal,
  contentLabel,
  title,
}: Props) {
  return (
    <ReactModal
      ariaHideApp={false}
      closeTimeoutMS={200}
      shouldFocusAfterRender={false}
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel={contentLabel}
      overlayClassName="bg-black bg-opacity-50 fixed inset-0 flex justify-center items-center cursor-pointer"
      className="rounded-lg shadow-xl bg-white dark:bg-surface-02dp w-full max-w-md overflow-hidden relative p-5 cursor-auto mx-5"
      style={{ content: { maxHeight: "90vh" } }}
    >
      {title && (
        <h2 className="text-2xl font-bold dark:text-white mb-6">{title}</h2>
      )}
      <button
        onClick={closeModal}
        className="absolute right-5 top-5 text-gray-600 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300"
      >
        <CrossIcon className="w-6 h-6" />
      </button>
      {children}
    </ReactModal>
  );
}
