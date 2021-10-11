import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import * as dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import utils from "../../common/lib/utils";
import Container from "../components/Container";
import AllowanceMenu from "../components/AllowanceMenu";
import PublisherCard from "../components/PublisherCard";
import Progressbar from "../components/Progressbar";
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
  const history = useHistory();

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
        <div className="flex justify-between items-center pt-8 pb-4">
          <dl>
            <dt className="text-sm font-medium text-gray-500">Allowance</dt>
            <dd className="flex items-center font-bold text-xl">
              {allowance.usedBudget} / {allowance.totalBudget} sats
              <div className="ml-3 w-24">
                <Progressbar percentage={allowance.percentage} />
              </div>
            </dd>
          </dl>

          <AllowanceMenu
            allowance={allowance}
            onEdit={() => {
              fetchData();
            }}
            onDelete={() => {
              history.replace("/publishers");
            }}
          />
        </div>

        <div>
          <TransactionsTable
            transactions={allowance.payments.map((payment) => ({
              ...payment,
              type: "sent",
              date: dayjs(payment.createdAt).fromNow(),
              // date: dayjs.unix(payment.createdAt),
              title: payment.name,
              subTitle: (
                <p className="truncate">
                  {payment.name} @{" "}
                  <a target="_blank" href={payment.location} rel="noreferrer">
                    {payment.location}
                  </a>
                </p>
              ),
            }))}
          />
        </div>
      </Container>
    </div>
  );
}

export default Publisher;
