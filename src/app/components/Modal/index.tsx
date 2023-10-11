import { CrossIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import ReactModal from "react-modal";

type Props = {
  children?: React.ReactNode;
  isOpen: boolean;
  close: () => void;
  title: string;
};

export default function Modal({
  children,
  isOpen,
  close: closeModal,
  title,
}: Props) {
  return (
    <ReactModal
      ariaHideApp={false}
      closeTimeoutMS={200}
      shouldFocusAfterRender={false}
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel={title}
      overlayClassName="bg-black bg-opacity-50 fixed inset-0 flex justify-center items-center p-5 cursor-pointer"
      className="rounded-lg shadow-xl bg-white dark:bg-surface-02dp w-full max-w-md overflow-hidden relative px-4 pt-10 pb-6 cursor-auto"
      style={{ content: { maxHeight: "90vh" } }}
    >
      <button
        onClick={closeModal}
        className="absolute right-4 top-4  text-gray-600 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300"
      >
        <CrossIcon className="w-6 h-6" />
      </button>
      {children}
    </ReactModal>
  );
}
