import React from "react";
import { Link } from "react-router-dom";
import { ChevronRightIcon } from "@heroicons/react/outline";

type Props = {
  to: string;
  title: string;
  description?: string;
};

export default function LinkButton({ to, title, description }: Props) {
  return (
    <Link to={to} className="block">
      <div className="p-4 bg-white flex justify-between items-center shadow overflow-hidden border-b border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200">
        <div>
          <span className="block text-lg">{title}</span>
          {description && (
            <span className="text-sm text-gray-500">{description}</span>
          )}
        </div>
        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
      </div>
    </Link>
  );
}
