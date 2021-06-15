import React from "react";
import { calcFiatFromSatoshi } from "../../../common/utils/helpers";
import { formatRelative, subDays } from "date-fns";
import { PlusIcon } from "@heroicons/react/outline";

import { Empty } from "antd";
import { sortByFieldAscending } from "../../../common/utils/helpers.js";

function Transactions({ exchangeRate, transactions }) {
  if (transactions?.length > 0) {
    console.log(sortByFieldAscending(transactions, "creation_date"));

    return (
      <div className="divide-y divide-gray-200">
        {sortByFieldAscending(transactions, "creation_date").map((item) => (
          <div key={item.payment_index} className="flex py-4 items-center">
            <div className="flex justify-center items-center w-8 h-8 border-2 border-gray-200 rounded-full">
              <PlusIcon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="ml-4">
              <div className="text-lg">John Doe</div>
              <div className="text-sm text-gray-500">
                {/* setting 1.1.2000 as a fallback */}
                {formatRelative(
                  new Date(parseInt(item.creation_date) * 1000 ?? 946681200),
                  new Date()
                )}
              </div>
            </div>
            <div className="text-right ml-auto">
              <div className="text-lg">{`₿${item.value}`}</div>
              <div className="text-sm text-gray-500">{`$${calcFiatFromSatoshi(
                exchangeRate ?? null,
                item.value
              )}`}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="transactions--container">
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    </div>
  );
}

export default Transactions;
