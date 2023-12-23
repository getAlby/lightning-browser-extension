type Props = {
  title: string;
};

function ScreenHeader({ title }: Props) {
  return (
    <div
      tabIndex={0}
      className="text-center text-lg font-semibold dark:text-white py-2 border-b border-gray-200 dark:border-neutral-700"
    >
      {title}
    </div>
  );
}

export default ScreenHeader;
