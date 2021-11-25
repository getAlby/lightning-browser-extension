import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Transaction } from "../../types";
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
    percentage: "",
    id: "",
  });
  const { id } = useParams();
  const navigate = useNavigate();

  async function fetchData() {
    try {
      if (id) {
        const response = await utils.call("getAllowanceById", {
          id: parseInt(id),
        });
        setAllowance(response);
      }
    } catch (e) {
      console.error(e);
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
              {allowance.usedBudget} / {allowance.totalBudget} sat used
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
              navigate("/publishers", { replace: true });
            }}
          />
        </div>

        <div>
          <TransactionsTable
            transactions={allowance.payments.map(
              (
                payment: {
                  createdAt: string;
                  name: string;
                  location: string;
                } & Transaction
              ) => ({
                ...payment,
                type: "sent",
                date: dayjs(payment.createdAt).fromNow(),
                title: payment.name,
              })
            )}
          />
        </div>
      </Container>
    </div>
  );
}

export default Publisher;
