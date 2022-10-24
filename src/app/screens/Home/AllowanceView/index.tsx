import { CaretLeftIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import AllowanceMenu from "@components/AllowanceMenu";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import Loading from "@components/Loading";
import Progressbar from "@components/Progressbar";
import PublisherCard from "@components/PublisherCard";
import TransactionsTable from "@components/TransactionsTable";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FC, useState, useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useSettings } from "~/app/context/SettingsContext";
import type { Allowance, Transaction } from "~/types";

dayjs.extend(relativeTime);

type Props = {
  allowance: Allowance;
  onGoBack: () => void;
  onEditComplete: () => void;
  onDeleteComplete: () => void;
};

const AllowanceView: FC<Props> = (props) => {
  const {
    isLoading: isLoadingSettings,
    settings,
    getFiatValue,
  } = useSettings();

  const [payments, setPayments] = useState<Transaction[] | null>(null);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);

  const { t } = useTranslation("translation", { keyPrefix: "home" });

  const showFiat = !isLoadingSettings && settings.showFiat;
  const hasPayments = !isLoadingPayments && !!payments?.length;
  const isEmptyPayments = !isLoadingPayments && payments?.length === 0;

  // get array of payments if not done yet
  useEffect(() => {
    const getPayments = async () => {
      const payments: Transaction[] = props.allowance.payments.map(
        (payment) => ({
          ...payment,
          id: `${payment.id}`,
          type: "sent",
          date: dayjs(payment.createdAt).fromNow(),
          title: payment.name || payment.description,
          publisherLink: `options.html#/publishers/${payment.id}`,
        })
      );

      try {
        // attach fiatAmount if enabled
        for await (const payment of payments) {
          const totalAmountFiat = showFiat
            ? await getFiatValue(payment.totalAmount)
            : "";
          payment.totalAmountFiat = totalAmountFiat;
        }

        setPayments(payments);
      } catch (e) {
        console.error(e);
        if (e instanceof Error) toast.error(e.message);
      } finally {
        setIsLoadingPayments(false);
      }
    };

    !payments && !isLoadingSettings && getPayments();
  }, [
    props.allowance.payments,
    isLoadingSettings,
    payments,
    getFiatValue,
    showFiat,
  ]);

  return (
    <div className="overflow-y-auto no-scrollbar h-full">
      <Header
        title={props.allowance.host}
        headerLeft={
          <IconButton
            onClick={props.onGoBack}
            icon={<CaretLeftIcon className="w-4 h-4" />}
          />
        }
      />
      <div className="mx-4">
        <PublisherCard
          title={props.allowance.name}
          image={props.allowance.imageURL}
          isCard={true}
          isSmall={false}
        />
      </div>
      <div className="px-4 pb-5">
        <div className="flex justify-between items-center py-3">
          <dl className="mb-0">
            <dt className="text-xs text-gray-500 dark:text-neutral-400">
              {t("allowance_view.allowance")}
            </dt>
            <dd className="flex items-center mb-0 text-sm font-medium dark:text-neutral-400">
              {+props.allowance.totalBudget > 0
                ? `${props.allowance.usedBudget} / ${props.allowance.totalBudget} `
                : "0 / 0 "}
              {t("allowance_view.sats_used")}
              <div className="ml-3 w-24">
                <Progressbar percentage={props.allowance.percentage} />
              </div>
            </dd>
          </dl>

          <div className="flex items-center">
            <AllowanceMenu
              allowance={props.allowance}
              onEdit={props.onEditComplete}
              onDelete={props.onDeleteComplete}
            />
          </div>
        </div>

        <h2 className="mb-2 text-lg text-gray-900 font-bold dark:text-white">
          {t("allowance_view.recent_transactions")}
        </h2>

        {isLoadingPayments && (
          <div className="flex justify-center">
            <Loading />
          </div>
        )}

        {hasPayments && <TransactionsTable transactions={payments} />}

        {isEmptyPayments && (
          <p className="text-gray-500 dark:text-neutral-400">
            <Trans
              i18nKey={"allowance_view.no_transactions"}
              t={t}
              values={{ name: props.allowance.name }}
              // eslint-disable-next-line react/jsx-key
              components={[<strong></strong>]}
            />
          </p>
        )}
      </div>
    </div>
  );
};

export default AllowanceView;
