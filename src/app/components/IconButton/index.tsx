type Props = {
  icon: React.ReactNode;
  onClick: () => void;
};

function IconButton({ onClick, icon }: Props) {
  return (
    <button
      className="flex justify-center items-center w-8 h-8 dark:text-white rounded-md border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-surface-08dp transition-colors duration-200"
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

export default IconButton;
