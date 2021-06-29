import React from "react";
import { ChevronRightIcon } from "@heroicons/react/outline";

import Badge from "./Shared/badge";

export default function PublishersTable({ publishers }) {
  return (
    <table className="min-w-full">
      <tbody className="divide-y divide-gray-200">
        {publishers.map((publisher) => (
          <tr
            key={publisher.id}
            className="hover:bg-gray-50 transition duration-200"
          >
            <td className="pr-6 py-6 whitespace-nowrap">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img
                    className="h-12 w-12 rounded-full shadow-lg"
                    src={publisher.image}
                    alt=""
                  />
                </div>
                <div className="ml-4">
                  <div className="flex items-center">
                    <p className="text-xl inline mr-2">{publisher.name}</p>
                    {publisher.badge && (
                      <Badge
                        label={publisher.badge.label}
                        color={publisher.badge.color}
                        textColor={publisher.badge.textColor}
                      />
                    )}
                  </div>
                  <div className="text-base text-gray-500">
                    {publisher.description}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-6 whitespace-nowrap text-right">
              <div className="ml-40">
                <p className="text-lg text-gray-700 mb-0">
                  {publisher.sats} sats
                </p>
                <div className="relative mt-2 w-44 ml-auto">
                  <div className="flex items-center">
                    <div
                      style={{ width: `${publisher.percentage}%` }}
                      className="ml-auto h-2 shadow-none rounded flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    />
                    <span
                      className={`ml-2 text-sm font-semibold text-blue-500`}
                    >
                      {publisher.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            </td>
            <td className="w-8">
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
