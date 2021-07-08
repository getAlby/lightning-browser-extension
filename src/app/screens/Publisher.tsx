import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import utils from "../../common/lib/utils";
import Container from "../components/Container";
import PublisherCard from "../components/PublisherCard";
import Progressbar from "../components/Shared/progressbar";
import TransactionsTable from "../components/TransactionsTable";

dayjs.extend(relativeTime);

function Publisher() {
  const [allowance, setAllowance] = useState({
    host: "",
    imageURL: "",
    remainingBudget: 0,
    usedBudget: 0,
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
      <PublisherCard
        title={allowance.host}
        image={allowance.imageURL}
        url={`https://${allowance.host}`}
      />
      <Container>
        <div className="flex justify-between items-center py-3">
          <dl>
            <dt className="text-sm">Allowance</dt>
            <dd className="text-sm text-gray-500">
              {allowance.usedBudget} / {allowance.totalBudget} sats
            </dd>
          </dl>
          <div className="w-24">
            <Progressbar percentage={allowance.percentage} />
          </div>
        </div>

        <div>
          <TransactionsTable
            transactions={allowance.payments.map((payment) => ({
              ...payment,
              type: "sent",
              date: dayjs(payment.createdAt).fromNow(),
              // date: dayjs.unix(payment.createdAt),
              title: payment.description,
              subTitle: (
                <p>
                  {payment.name} @{" "}
                  <a target="_blank" href={payment.location}>
                    {payment.location}
                  </a>
                </p>
              ),
              currency: "€",
              value: 9.99,
            }))}
          />
        </div>
      </Container>
    </div>
  );
}

export default Publisher;
