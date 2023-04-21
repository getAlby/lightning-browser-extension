import { Link } from "react-router-dom";

type Props = {
  to: string;
  title: string;
  logo?: string;
};

export default function LinkButton({ to, title, logo }: Props) {
  return (
    <Link to={to} className="block">
      <div className="p-4 bg-white dark:bg-surface-02dp h-64 lg:h-80 text-center shadow overflow-hidden border-b border-gray-300 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition duration-200">
        <div className="my-4 lg:my-12">
          <img src={logo} alt="logo" className="inline rounded-3xl w-32" />
        </div>
        <div>
          <span className="block dark:text-white text-lg font-medium">
            {title}
          </span>
        </div>
      </div>
    </Link>
  );
}
