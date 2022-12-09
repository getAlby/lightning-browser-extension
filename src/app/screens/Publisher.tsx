import AllowanceMenu from "@components/AllowanceMenu";
import Container from "@components/Container";
import Progressbar from "@components/Progressbar";
import PublisherCard from "@components/PublisherCard";
import TransactionsTable from "@components/TransactionsTable";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSettings } from "~/app/context/SettingsContext";
import msg from "~/common/lib/msg";
import type { Allowance, Transaction } from "~/types";

dayjs.extend(relativeTime);

function Publisher() {
  const { t } = useTranslation("translation", {
    keyPrefix: "publishers",
  });
  const {
    isLoading: isLoadingSettings,
    settings,
    getFormattedFiat,
    getFormattedNumber,
  } = useSettings();

  const hasFetchedData = useRef(false);
  const [allowance, setAllowance] = useState<Allowance | undefined>();
  const [payments, setPayments] = useState<Transaction[] | undefined>();
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      if (id) {
        const response = await msg.request<Allowance>("getAllowanceById", {
          id: parseInt(id),
        });
        setAllowance(response);

        const payments: Transaction[] = response.payments.map((payment) => ({
          ...payment,
          id: `${payment.id}`,
          type: "sent",
          date: dayjs(payment.createdAt).fromNow(),
          title: payment.name || payment.description,
          publisherLink: payment.location,
        }));

        for (const payment of payments) {
          const totalAmountFiat = settings.showFiat
            ? await getFormattedFiat(payment.totalAmount)
            : "";
          payment.totalAmountFiat = totalAmountFiat;
        }
        setPayments(payments);
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  }, [id, settings.showFiat, getFormattedFiat]);

  useEffect(() => {
    // Run once.
    if (!isLoadingSettings && !hasFetchedData.current) {
      fetchData();
      hasFetchedData.current = true;
    }
  }, [fetchData, isLoadingSettings]);

  return (
    <div>
      <div className="border-b border-gray-200 dark:border-neutral-500">
        <PublisherCard
          title={allowance?.host || ""}
          image={allowance?.imageURL || ""}
          url={allowance?.host}
          isCard={false}
          isSmall={false}
        />
      </div>

      {allowance && (
        <Container>
          <div className="flex justify-between items-center pt-8 pb-4">
            <dl>
              <dt className="text-sm font-medium text-gray-500">
                {t("publisher.allowance.title")}
              </dt>

              <dd className="flex items-center font-bold text-xl dark:text-neutral-400">
                {getFormattedNumber(allowance.usedBudget)} /{" "}
                {getFormattedNumber(allowance.totalBudget)}{" "}
                {t("publisher.allowance.used_budget")}
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
            {payments && payments?.length > 0 && (
              <TransactionsTable transactions={payments} />
            )}
          </div>
        </Container>
      )}
    </div>
  );
}

export default Publisher;
