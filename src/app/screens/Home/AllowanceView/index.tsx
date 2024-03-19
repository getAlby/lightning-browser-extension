import Header from "@components/Header";
import IconButton from "@components/IconButton";
import Progressbar from "@components/Progressbar";
import PublisherCard from "@components/PublisherCard";
import SitePreferences from "@components/SitePreferences";
import TransactionsTable from "@components/TransactionsTable";
import { PopiconsChevronLeftLine } from "@popicons/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "~/app/components/Toast";
import { useSettings } from "~/app/context/SettingsContext";
import { PublisherLnData } from "~/app/screens/Home/PublisherLnData";
import { convertPaymentsToTransactions } from "~/app/utils/payments";
import type { Allowance, Battery, Transaction } from "~/types";

dayjs.extend(relativeTime);

type Props = {
  allowance: Allowance;
  lnDataFromCurrentTab?: Battery[];
  onGoBack: () => void;
  onEditComplete: () => void;
  onDeleteComplete: () => void;
};

const AllowanceView: FC<Props> = (props) => {
  const {
    isLoading: isLoadingSettings,
    settings,
    getFormattedFiat,
    getFormattedNumber,
  } = useSettings();

  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  const { t } = useTranslation("translation", { keyPrefix: "home" });

  const showFiat = !isLoadingSettings && settings.showFiat;

  // get array of payments if not done yet
  useEffect(() => {
    const getTransactions = async () => {
      const transactions: Transaction[] = await convertPaymentsToTransactions(
        props.allowance.payments,
        `options.html#/publishers/${props.allowance.id}`
      );

      try {
        // attach fiatAmount if enabled
        for (const transaction of transactions) {
          transaction.totalAmountFiat = showFiat
            ? await getFormattedFiat(transaction.totalAmount)
            : "";
        }

        setTransactions(transactions);
      } catch (e) {
        console.error(e);
        if (e instanceof Error) toast.error(e.message);
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    !transactions && !isLoadingSettings && getTransactions();
  }, [
    props.allowance,
    isLoadingSettings,
    transactions,
    getFormattedFiat,
    showFiat,
  ]);

  const hasBudget = +props.allowance.totalBudget > 0;
  return (
    <div className="overflow-y-auto no-scrollbar h-full">
      <Header
        headerLeft={
          <IconButton
            onClick={props.onGoBack}
            icon={<PopiconsChevronLeftLine className="w-5 h-5" />}
          />
        }
      >
        {props.allowance.host}
      </Header>
      {props.allowance ? (
        <div className="relative mx-4">
          <PublisherCard
            title={props.allowance.name}
            image={props.allowance.imageURL}
            isCard={true}
            isSmall={false}
          />
          <div className="absolute top-1.5 right-1.5">
            <SitePreferences
              launcherType="icon"
              allowance={props.allowance}
              onEdit={props.onEditComplete}
              onDelete={props.onDeleteComplete}
            />
          </div>
        </div>
      ) : (
        props.lnDataFromCurrentTab && (
          <PublisherLnData lnData={props.lnDataFromCurrentTab[0]} />
        )
      )}
      <div className="px-4 pb-5">
        {hasBudget ? (
          <div className="flex flex-col py-4">
            <dl className="mb-1 flex justify-between items-center">
              <dt className="text-black font-medium dark:text-neutral-400">
                {t("allowance_view.budget_spent")}
              </dt>
              <dd className="text-sm text-gray-600">
                {hasBudget
                  ? `${getFormattedNumber(
                      props.allowance.usedBudget
                    )} / ${getFormattedNumber(props.allowance.totalBudget)} `
                  : "0 / 0 "}
                {t("allowance_view.sats")}
              </dd>
            </dl>
            <Progressbar percentage={props.allowance.percentage} />
          </div>
        ) : (
          <div className="my-6 text-center text-sm">
            <SitePreferences
              launcherType="hyperlink"
              allowance={props.allowance}
              onEdit={props.onEditComplete}
              onDelete={props.onDeleteComplete}
            />
          </div>
        )}
        <TransactionsTable
          loading={isLoadingTransactions}
          transactions={transactions}
        />
      </div>
    </div>
  );
};

export default AllowanceView;
