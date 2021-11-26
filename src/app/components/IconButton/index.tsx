type Props = {
  icon: React.ReactNode;
  onClick: () => void;
};

function IconButton({ onClick, icon }: Props) {
  return (
    <button
      className="flex justify-center items-center w-8 h-8 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

export default IconButton;
