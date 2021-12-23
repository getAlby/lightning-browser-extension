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
      <div className="p-4 bg-white dark:bg-gray-800 h-96 text-center shadow-lg overflow-hidden border-b border-gray-200 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200">
        <div className="my-12">
          <img src={logo} alt="logo" className="inline rounded-3xl w-32" />
        </div>
        <div>
          <span className="block dark:text-white text-lg">{title}</span>
          {description && (
            <span className="text-sm text-gray-500 dark:text-gray-300">
              {description}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
