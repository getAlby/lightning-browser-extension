import { classNames } from "../../utils/index";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string;
  logo: string;
  subtitle: string;
  to: string;
  payment?: string;
  primary?: boolean;
  shadow?: boolean;
};
export default function OtherCard({
  title,
  subtitle,
  logo,
  to,
  payment = "",
  primary = false,
  shadow = false,
}: Props) {
  return (
    <a href={to} target="_blank" rel="noreferrer">
      <div
        className={classNames(
          primary
            ? "bg-white shadow-md flex space-x-3 h-44 px-4 rounded-lg pt-7 hover:bg-gray-50 cursor-pointer w-full"
            : "bg-white shadow-lg w-full rounded-lg h-28 hover:bg-gray-50 my-3  cursor-pointer"
        )}
      >
        <div
          className={classNames(
            primary ? "" : "flex px-5 justify-between py-6"
          )}
        >
          <div
            className={classNames(
              primary ? "flex  space-x-2" : "flex items-center space-x-2"
            )}
          >
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
              <p className="font-serif text-sm font-normal text-gray-500">
                {subtitle} {!primary ? <span>{payment} payment</span> : null}
              </p>
            </div>
          </div>
          {!primary ? (
            <div className=" flex items-center">
              <img
                src="assets/icons/arrow-right.svg"
                alt="image"
                className="w-2"
              />
            </div>
          ) : null}
        </div>
      </div>
    </a>
  );
}
