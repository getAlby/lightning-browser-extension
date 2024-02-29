import { Link } from "react-router-dom";

type Props = {
  to: string;
  title: string;
  logo?: string;
};

export default function LinkButton({ to, title, logo }: Props) {
  return (
    <Link to={to}>
      <div className="p-10 h-72 border border-gray-200 dark:border-neutral-700 bg-white dark:bg-surface-02dp text-center overflow-hidden rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition duration-200 flex flex-col justify-center space-y-4">
        <div>
          <img src={logo} alt="logo" className="inline rounded-3xl w-32 mb-6" />
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
