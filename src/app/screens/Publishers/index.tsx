import Container from "@components/Container";
import PublishersTable from "@components/PublishersTable";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import utils from "~/common/lib/utils";
import { Allowance, Publisher } from "~/types";

import websites from "./websites.json";

function Publishers() {
  const { t } = useTranslation("translation", {
    keyPrefix: "publishers",
  });

  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const navigate = useNavigate();

  function navigateToPublisher(id: number) {
    navigate(`/publishers/${id}`);
  }

  async function fetchData() {
    try {
      const allowanceResponse = await utils.call<{
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
          ...(allowance.remainingBudget > 0 && {
            badge: {
              label: "ACTIVE",
              color: "green-bitcoin",
              textColor: "white",
            },
          }),
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
        {t("used.title")}
      </h2>

      <p className="mb-6 text-gray-500 dark:text-neutral-500">
        {t("used.description")}
      </p>

      {publishers.length > 0 ? (
        <PublishersTable
          publishers={publishers}
          navigateToPublisher={navigateToPublisher}
        />
      ) : (
        <p className="dark:text-white"> {t("used.no_info")}</p>
      )}

      <h2 className="mt-12 mb-2 text-2xl font-bold dark:text-white">
        {t("suggestions.title")}
      </h2>

      <p className="mb-6 text-gray-500 dark:text-neutral-500">
        {t("suggestions.description")}
      </p>

      <div className="mb-12">
        {websites.map(({ title, items }) => (
          <div className="mb-6" key={title}>
            <h4 className="mb-4 text-xl font-bold dark:text-white">
              {t(`suggestions.list.${title}`)}
            </h4>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {items.map(({ title, subtitle, logo, url }) => (
                <a key={url} href={url} target="_blank" rel="noreferrer">
                  <div className="bg-white dark:bg-surface-02dp shadow-md flex p-4 h-32 rounded-lg hover:bg-gray-50 cursor-pointer w-full">
                    <div className="flex space-x-3">
                      <img
                        src={logo}
                        alt="image"
                        className="h-14 w-14 rounded-xl shadow-md object-cover"
                      />

                      <div>
                        <h2 className="font-medium font-serif text-base dark:text-white">
                          {title}
                        </h2>

                        <p className="font-serif text-sm font-normal text-gray-500 dark:text-neutral-500 line-clamp-3">
                          {subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}

export default Publishers;
