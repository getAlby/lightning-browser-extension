type Props = {
  icon: React.ReactNode;
  onClick: () => void;
};

function IconButton({ onClick, icon }: Props) {
  return (
    <button
      className="flex justify-center items-center w-8 h-8 bg-gray-50 dark:bg-surface-04dp dark:text-white rounded-md border border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-surface-12dp transition-colors duration-200"
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

export default IconButton;
