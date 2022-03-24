type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

function Setting({ title, subtitle, children }: Props) {
  return (
    <div className="py-4 flex justify-between items-center">
      <div>
        <span className="text-gray-700 dark:text-white font-medium">
          {title}
        </span>
        <p className="text-gray-400 text-sm">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

export default Setting;
