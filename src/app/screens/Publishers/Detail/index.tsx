import Container from "@components/Container";
import PublisherPanel from "@components/PublisherPanel";
import TransactionsTable from "@components/TransactionsTable";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "~/app/components/Toast";
import { useSettings } from "~/app/context/SettingsContext";
import { convertPaymentsToTransactions } from "~/app/utils/payments";
import msg from "~/common/lib/msg";
import type { Allowance, Transaction } from "~/types";

dayjs.extend(relativeTime);

function PublisherDetail() {
  const {
    isLoading: isLoadingSettings,
    settings,
    getFormattedFiat,
  } = useSettings();

  const hasFetchedData = useRef(false);
  const [allowance, setAllowance] = useState<Allowance | undefined>();
  const [transactions, setTransactions] = useState<Transaction[] | undefined>();
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      if (id) {
        const response = await msg.request<Allowance>("getAllowanceById", {
          id: parseInt(id),
        });
        setAllowance(response);

        const _transactions: Transaction[] = convertPaymentsToTransactions(
          response.payments
        );

        for (const payment of _transactions) {
          if (
            payment.displayAmount &&
            payment.displayAmount[1] === settings.currency
          )
            continue;
          payment.totalAmountFiat = settings.showFiat
            ? await getFormattedFiat(payment.totalAmount)
            : "";
        }
        setTransactions(_transactions);
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  }, [id, settings.showFiat, getFormattedFiat, settings.currency]);

  useEffect(() => {
    // Run once.
    if (!isLoadingSettings && !hasFetchedData.current) {
      fetchData();
      hasFetchedData.current = true;
    }
  }, [fetchData, isLoadingSettings]);

  return (
    <>
      {allowance && (
        <PublisherPanel
          allowance={allowance}
          onEdit={fetchData}
          onDelete={() => {
            navigate("/publishers", { replace: true });
          }}
          title={allowance?.name || ""}
          image={allowance?.imageURL || ""}
          url={allowance?.host}
          isCard={false}
          isSmall={false}
        />
      )}
      {allowance && (
        <Container>
          <div className="mt-4">
            <TransactionsTable transactions={transactions} />
          </div>
        </Container>
      )}
    </>
  );
}

export default PublisherDetail;
