import Container from "@components/Container";
import PublishersTable from "@components/PublishersTable";
import Tips from "@components/Tips";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "~/app/components/Button";
import { useTips } from "~/app/hooks/useTips";
import msg from "~/common/lib/msg";
import { Allowance, Badge, Publisher } from "~/types";

function Publishers() {
  const { t } = useTranslation("translation", {
    keyPrefix: "publishers",
  });

  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const { tips } = useTips();

  const hasTips = tips.length > 0;

  const navigate = useNavigate();

  function navigateToPublisher(id: number) {
    navigate(`/publishers/${id}`);
  }

  async function fetchData() {
    try {
      const allowanceResponse = await msg.request<{
        allowances: Allowance[];
      }>("listAllowances");

      const allowances: Publisher[] = allowanceResponse.allowances.reduce<
        Publisher[]
      >((acc, allowance) => {
        if (!allowance?.id || !allowance.enabled) return acc;

        const {
          id,
          host,
          imageURL,
          name,
          payments,
          paymentsAmount,
          paymentsCount,
          percentage,
          totalBudget,
          usedBudget,
        } = allowance;

        const badges: Badge[] = [];
        if (allowance.remainingBudget > 0) {
          badges.push({
            label: "active",
            color: "green-bitcoin",
            textColor: "white",
          });
        }
        if (allowance.lnurlAuth) {
          badges.push({
            label: "auth",
            color: "green-bitcoin",
            textColor: "white",
          });
        }
        acc.push({
          id,
          host,
          imageURL,
          name,
          payments,
          paymentsAmount,
          paymentsCount,
          percentage,
          totalBudget,
          usedBudget,
          badges,
        });

        return acc;
      }, []);

      setPublishers(allowances);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container>
      <h2 className="mt-12 mb-2 text-2xl font-bold dark:text-white">
        {t("title")}
      </h2>

      <p className="mb-6 text-gray-500 dark:text-neutral-500">
        {t("description")}
      </p>

      {publishers.length > 0 ? (
        <PublishersTable
          publishers={publishers}
          navigateToPublisher={navigateToPublisher}
        />
      ) : (
        <>
          {hasTips && (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              <Tips />
            </div>
          )}
          <Link to="/discover">
            <Button primary label={t("discover")} />
          </Link>
        </>
      )}
    </Container>
  );
}

export default Publishers;
