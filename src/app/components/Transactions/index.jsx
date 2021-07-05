import React from "react";
import { calcFiatFromSatoshi } from "../../../common/utils/helpers";
import * as dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { PlusIcon } from "@heroicons/react/outline";
import { sortByFieldAscending } from "../../../common/utils/helpers.js";

dayjs.extend(relativeTime);

function Transactions({ exchangeRate, transactions }) {
  if (transactions?.length > 0) {
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
                {dayjs(item.creation_date).fromNow()}
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
      <p>No transactions.</p>
    </div>
  );
}

export default Transactions;
