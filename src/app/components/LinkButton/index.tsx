import { Link } from "react-router-dom";
import { CaretRightIcon } from "@bitcoin-design/bitcoin-icons-react/filled";

type Props = {
  to: string;
  title: string;
  description?: string;
  logo?: string;
};

export default function LinkButton({ to, title, description, logo }: Props) {
  return (
    <Link to={to} className="block">
      <div className="p-4 bg-white dark:bg-gray-800 flex justify-between items-center shadow overflow-hidden border-b border-gray-200 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200">
        <div>
          <span className="block dark:text-white text-lg">{title}</span>
          {description && (
            <span className="text-sm text-gray-500 dark:text-gray-300">
              {description}
            </span>
          )}
        </div>
        <div>
          <img
            src={logo}
            alt="logo"
            width="75em"
            height="75em"
            className="inline rounded-lg mr-3"
          />
          <CaretRightIcon className="h-5 w-5 inline dark:text-white" />
        </div>
      </div>
    </Link>
  );
}
