import { CrossIcon } from "@bitcoin-design/bitcoin-icons-react/filled";

export type Props = {
  title: string;
  description: string | JSX.Element | (JSX.Element | string)[];
  buttons?: JSX.Element[];
  handleClose: () => void;
};

export default function CloseableCard({
  title,
  description,
  buttons,
  handleClose,
}: Props) {
  const uiDescription = Array.isArray(description) ? (
    <ol className="list-decimal mx-4 h-12 font-serif text-sm font-normal text-gray-500 dark:text-neutral-500 mb-2">
      {description.map((text, index) => (
        <li key={index}>{text}</li>
      ))}
    </ol>
  ) : (
    <p className="h-12 font-serif text-sm font-normal text-gray-500 dark:text-neutral-500 mb-2">
      {description}
    </p>
  );
  return (
    <div className="bg-white dark:bg-surface-02dp shadow-md p-4 h-44 rounded-lg w-full relative">
      <button
        onClick={handleClose}
        className="flex items-center absolute top-0 right-0 p-2 dark:text-white"
      >
        <CrossIcon className="h-5 w-5" />
      </button>
      <h4 className="my-2 text-l font-bold dark:text-white">{title}</h4>

      {uiDescription}

      {!!buttons?.length && (
        <div className="flex space-x-3 mb-2">{buttons}</div>
      )}
    </div>
  );
}
