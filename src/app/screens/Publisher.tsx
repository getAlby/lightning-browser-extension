import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import utils from "../../common/lib/utils";
import PublisherCard from "../components/PublisherCard";
import Progressbar from "../components/Shared/progressbar";
import TransactionsTable from "../components/TransactionsTable";

dayjs.extend(relativeTime);

function Publisher() {
  const [allowance, setAllowance] = useState({
    host: "",
    imageURL: "",
    remainingBudget: 0,
    totalBudget: 0,
    payments: [],
  });
  const { id } = useParams();

  async function fetchData() {
    try {
      const response = await utils.call("getAllowanceById", {
        id: parseInt(id),
      });
      console.log(response);
      setAllowance(response);
    } catch (e) {
      console.log(e.message);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <PublisherCard title={allowance.host} image={allowance.imageURL} />
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3 border-b border-grey-200">
          <dl>
            <dt className="text-sm">Allowance</dt>
            <dd className="text-sm text-gray-500">
              {allowance.remainingBudget} / {allowance.totalBudget} sats
            </dd>
          </dl>
          <div className="w-24">
            <Progressbar
              filledColor="blue-bitcoin"
              notFilledColor="blue-200"
              textColor="white"
            />
          </div>
        </div>

        <div>
          <TransactionsTable
            transactions={allowance.payments.map((payment) => ({
              ...payment,
              type: "sent",
              date: dayjs(payment.createdAt).fromNow(),
              // date: dayjs.unix(payment.createdAt),
              title: payment.name,
              currency: "€",
              value: 9.99,
            }))}
          />
        </div>
      </div>
    </div>
  );
}

export default Publisher;
