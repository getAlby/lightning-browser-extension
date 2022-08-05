type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  link?: string[];
};

function Setting({ title, subtitle, children, link }: Props) {
  return (
    <div className="py-4 flex justify-between items-center">
      <div>
        <span className="text-gray-900 dark:text-white font-medium">
          {title}
        </span>
        <p className="text-gray-500 dark:text-neutral-500 text-sm">
          {subtitle}
          {link && <a href={link[0]}>{link[1]}</a>}
        </p>
      </div>
      {children}
    </div>
  );
}

export default Setting;
