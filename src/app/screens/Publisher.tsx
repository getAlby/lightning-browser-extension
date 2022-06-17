import AllowanceMenu from "@components/AllowanceMenu";
import Container from "@components/Container";
import Progressbar from "@components/Progressbar";
import PublisherCard from "@components/PublisherCard";
import TransactionsTable from "@components/TransactionsTable";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import utils from "~/common/lib/utils";
import { getFiatValue } from "~/common/utils/currencyConvert";
import { Allowance } from "~/types";

dayjs.extend(relativeTime);

function Publisher() {
  const hasFetchedData = useRef(false);
  const [allowance, setAllowance] = useState<Allowance | undefined>();
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      if (id) {
        const response = await utils.call<Allowance>("getAllowanceById", {
          id: parseInt(id),
        });
        for await (const payment of response.payments) {
          const totalAmountFiat = await getFiatValue(payment.totalAmount);
          payment.totalAmountFiat = totalAmountFiat;
        }
        setAllowance(response);
      }
    } catch (e) {
      console.error(e);
    }
  }, [id]);

  useEffect(() => {
    // Run once.
    if (!hasFetchedData.current) {
      fetchData();
      hasFetchedData.current = true;
    }
  }, [fetchData]);

  return (
    <div>
      <PublisherCard
        title={allowance?.host || ""}
        image={allowance?.imageURL || ""}
        url={allowance ? `https://${allowance.host}` : ""}
      />
      {allowance && (
        <Container>
          <div className="flex justify-between items-center pt-8 pb-4">
            <dl>
              <dt className="text-sm font-medium text-gray-500">Allowance</dt>
              <dd className="flex items-center font-bold text-xl dark:text-neutral-400">
                {allowance.usedBudget} / {allowance.totalBudget} sats used
                <div className="ml-3 w-24">
                  <Progressbar percentage={allowance.percentage} />
                </div>
              </dd>
            </dl>

            <AllowanceMenu
              allowance={allowance}
              onEdit={fetchData}
              onDelete={() => {
                navigate("/publishers", { replace: true });
              }}
            />
          </div>

          <div>
            <TransactionsTable
              transactions={allowance.payments.map((payment) => ({
                ...payment,
                type: "sent",
                date: dayjs(payment.createdAt).fromNow(),
                title: (
                  <p className="truncate">
                    <a
                      target="_blank"
                      title={payment.name}
                      href={payment.location}
                      rel="noreferrer"
                    >
                      {payment.name}
                    </a>
                  </p>
                ),
              }))}
            />
          </div>
        </Container>
      )}
    </div>
  );
}

export default Publisher;
