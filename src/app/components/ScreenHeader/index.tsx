type Props = {
  title: string;
};

function ScreenHeader({ title }: Props) {
  return (
    <div className="text-center text-xl font-semibold dark:text-white py-2 border-b border-gray-200 dark:border-neutral-500">
      {title}
    </div>
  );
}

export default ScreenHeader;
