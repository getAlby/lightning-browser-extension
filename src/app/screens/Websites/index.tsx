import Container from "@components/Container";
import WebsitesTable from "@components/WebsitesTable";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "~/app/components/Button";
import msg from "~/common/lib/msg";
import { Allowance, Badge, Website } from "~/types";

function Websites() {
  const { t } = useTranslation("translation", {
    keyPrefix: "websites",
  });

  const [websites, setWebsites] = useState<Website[]>([]);
  const navigate = useNavigate();

  function navigateToWebsite(id: number) {
    navigate(`/websites/${id}`);
  }

  async function fetchData() {
    try {
      const allowanceResponse = await msg.request<{
        allowances: Allowance[];
      }>("listAllowances");

      const allowances: Website[] = allowanceResponse.allowances.reduce<
        Website[]
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

      setWebsites(allowances);
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

      {websites.length > 0 ? (
        <WebsitesTable
          websites={websites}
          navigateToWebsite={navigateToWebsite}
        />
      ) : (
        <>
          <p className="dark:text-white mb-4"> {t("no_info")}</p>
          <Link to="/discover">
            <Button primary label={t("discover")} />
          </Link>
        </>
      )}
    </Container>
  );
}

export default Websites;
