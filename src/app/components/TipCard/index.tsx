import {
  ArrowRightIcon,
  CrossIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import React from "react";
import { classNames } from "~/app/utils";

export type Props = {
  title: string;
  description: string;
  className: string;
  arrowClassName: string;
  backgroundIcon: React.ReactNode;
  handleClose: React.MouseEventHandler<HTMLButtonElement>;
};

export default function TipCard({
  title,
  description,
  handleClose,
  className,
  arrowClassName,
  backgroundIcon,
}: Props) {
  return (
    <div
      className={classNames(
        "shadow-md p-6 w-80 h-36 rounded-lg border-solid border-2 relative",
        !!className && className
      )}
    >
      {backgroundIcon && (
        <div className="absolute bottom-0 right-16">{backgroundIcon}</div>
      )}
      <div className="absolute bottom-10 right-6">
        {
          <ArrowRightIcon
            className={classNames(
              "w-8 h-8",
              !!arrowClassName && arrowClassName
            )}
          />
        }
      </div>
      <button
        onClick={handleClose}
        className="flex items-center absolute top-0 right-0 p-2 dark:text-white"
      >
        <CrossIcon className="h-5 w-5 text-neutral-400 hover:text-black dark:hover:text-white" />
      </button>
      <h4 className="text-xl font-bold text-gray-700 dark:text-white">
        {title}
      </h4>
      <p className="whitespace-pre-line text-gray-500 dark:text-neutral-400 mt-4">
        {description}
      </p>
    </div>
  );
}
