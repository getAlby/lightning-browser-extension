import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import utils from "../../common/lib/utils";
import PublisherCard from "../components/PublisherCard";
import Progressbar from "../components/Shared/progressbar";

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
          <p className="mt-8 text-xl font-bold">Temporary list of payments:</p>
          {allowance.payments.map((payment) => (
            <div key={payment.id} className="py-6 border-b border-gray-200">
              {payment.createdAt}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Publisher;
