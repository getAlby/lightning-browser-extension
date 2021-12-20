import { Link } from "react-router-dom";
import { classNames } from "../../utils/index";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string;
  logo: string;
  subtitle: string;
  to: string;
  shadow?: boolean;
};
export default function OtherCard({
  title,
  subtitle,
  logo,
  to,
  shadow = false,
}: Props) {
  return (
    <a href={to} target="_blank" rel="noreferrer">
      <div className="bg-white shadow-md flex space-x-3 h-44 px-4 rounded-lg pt-7 hover:bg-gray-50 cursor-pointer w-full ">
        <img
          src={logo}
          alt="image"
          className={classNames(
            shadow
              ? "h-14 w-14 rounded-xl shadow-md py-3 px-3"
              : `h-14 w-14 rounded-xl`
          )}
        />
        <div>
          <h2 className="font-medium  font-serif text-base">{title}</h2>
          <p className="font-serif text-sm font-normal text-light-gray-bitcoin2">
            {subtitle}
          </p>
        </div>
      </div>
    </a>
  );
}
