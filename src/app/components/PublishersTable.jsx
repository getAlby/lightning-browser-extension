import React from "react";

import Badge from "./Shared/badge";

const DEFAULT_IMAGE = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPjxyZWN0IHg9IjAiIHk9IjIiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiIHN0eWxlPSJmaWxsOiNhNGZhYWM7c3Ryb2tlOiNhNGZhYWM7c3Ryb2tlLXdpZHRoOjAuMDUiLz48cmVjdCB4PSI0IiB5PSIyIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBzdHlsZT0iZmlsbDojYTRmYWFjO3N0cm9rZTojYTRmYWFjO3N0cm9rZS13aWR0aDowLjA1Ii8+PHJlY3QgeD0iMSIgeT0iMSIgd2lkdGg9IjEiIGhlaWdodD0iMSIgc3R5bGU9ImZpbGw6I2E0ZmFhYztzdHJva2U6I2E0ZmFhYztzdHJva2Utd2lkdGg6MC4wNSIvPjxyZWN0IHg9IjMiIHk9IjEiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiIHN0eWxlPSJmaWxsOiNhNGZhYWM7c3Ryb2tlOiNhNGZhYWM7c3Ryb2tlLXdpZHRoOjAuMDUiLz48cmVjdCB4PSIxIiB5PSIzIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBzdHlsZT0iZmlsbDojYTRmYWFjO3N0cm9rZTojYTRmYWFjO3N0cm9rZS13aWR0aDowLjA1Ii8+PHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjEiIGhlaWdodD0iMSIgc3R5bGU9ImZpbGw6I2E0ZmFhYztzdHJva2U6I2E0ZmFhYztzdHJva2Utd2lkdGg6MC4wNSIvPjxyZWN0IHg9IjEiIHk9IjQiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiIHN0eWxlPSJmaWxsOiNhNGZhYWM7c3Ryb2tlOiNhNGZhYWM7c3Ryb2tlLXdpZHRoOjAuMDUiLz48cmVjdCB4PSIzIiB5PSI0IiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBzdHlsZT0iZmlsbDojYTRmYWFjO3N0cm9rZTojYTRmYWFjO3N0cm9rZS13aWR0aDowLjA1Ii8+PHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMSIgc3R5bGU9ImZpbGw6I2E0ZmFhYztzdHJva2U6I2E0ZmFhYztzdHJva2Utd2lkdGg6MC4wNSIvPjxyZWN0IHg9IjIiIHk9IjMiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiIHN0eWxlPSJmaWxsOiNhNGZhYWM7c3Ryb2tlOiNhNGZhYWM7c3Ryb2tlLXdpZHRoOjAuMDUiLz48L3N2Zz4=";
export default function PublishersTable({ publishers }) {
  return (
    <table className="min-w-full">
      <tbody className="divide-y divide-gray-200">
        {publishers.map((publisher) => (
          <tr key={publisher.id}>
            <td className="pr-6 py-6 whitespace-nowrap">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img
                    className="h-12 w-12 rounded-full shadow-lg"
                    src={publisher.image || DEFAULT_IMAGE}
                    alt={publisher.host}
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
                    {publisher.host} · {publisher.paymentsCount} payments
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-6 whitespace-nowrap text-right">
              {publisher.usedBudget && publisher.totalBudget && (
                <div className="ml-40">
                  <p className="text-lg text-gray-700 mb-0">
                    {publisher.usedBudget} / {publisher.totalBudget} sats
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
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
