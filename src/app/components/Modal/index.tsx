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
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel={title}
      overlayClassName="bg-black bg-opacity-50 fixed inset-0 flex justify-center items-center p-5"
      className="rounded-lg bg-white dark:bg-surface-02dp w-full max-w-md overflow-hidden"
      style={{ content: { maxHeight: "90vh" } }}
    >
      {children}
    </ReactModal>
  );
}
