type Props = {
  title: string;
  subtitle: string | React.ReactNode;
  children: React.ReactNode;
};

function Setting({ title, subtitle, children }: Props) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center py-4">
      <div>
        <span className="text-black dark:text-white font-medium">{title}</span>
        <p className="text-gray-600 mr-1 dark:text-neutral-400 text-sm">
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  );
}

export default Setting;
