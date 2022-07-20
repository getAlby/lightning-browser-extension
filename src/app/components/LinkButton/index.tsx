import { Link } from "react-router-dom";

type Props = {
  to: string;
  title: string;
  description?: string;
  logo?: string;
};

export default function LinkButton({ to, title, description, logo }: Props) {
  return (
    <Link to={to} className="block">
      <div className="p-4 bg-white dark:bg-surface-02dp h-96 text-center shadow-lg overflow-hidden border-b border-gray-300 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition duration-200">
        <div className="my-12">
          <img src={logo} alt="logo" className="inline rounded-3xl w-32" />
        </div>
        <div>
          <span className="block dark:text-white text-lg">{title}</span>
          {description && (
            <span className="text-sm text-gray-500 dark:text-neutral-300">
              {description}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
