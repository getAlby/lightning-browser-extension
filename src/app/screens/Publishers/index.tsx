import Button from "@components/Button";
import CloseableCard from "@components/CloseableCard";
import Container from "@components/Container";
import PublishersTable from "@components/PublishersTable";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSettings } from "~/app/context/SettingsContext";
import msg from "~/common/lib/msg";
import { Allowance, Badge, Publisher } from "~/types";

import websites from "./websites.json";

function Publishers() {
  const { t } = useTranslation("translation", {
    keyPrefix: "publishers",
  });

  const { settings, updateSetting } = useSettings();

  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const tips = settings.tips || [];

  const hasTips = tips.length > 0;

  function hasTip(id: string) {
    return tips.indexOf(id) > -1;
  }
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
      {(publishers.length > 0 || !hasTips) && (
        <>
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
        </>
      )}
      {publishers.length === 0 && hasTips && (
        <>
          <h2 className="mt-12 mb-2 text-2xl font-bold dark:text-white">
            {t("tips.title")}
          </h2>
          <p className="mb-6 text-gray-500 dark:text-neutral-500">
            {t("tips.description")}
          </p>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {hasTip("top_up_wallet") && (
              <CloseableCard
                handleClose={() =>
                  updateSetting({
                    tips: tips.filter((tip) => tip !== "top_up_wallet"),
                  })
                }
                title={t("tips.top_up_wallet.title")}
                description={t("tips.top_up_wallet.description")}
                buttons={[
                  <Button
                    key={1}
                    label={t("tips.top_up_wallet.label1")}
                    primary
                    onClick={() => {
                      navigate("/receive");
                    }}
                  />,
                  <a key={2} href="https://getalby.com/topup">
                    <Button label={t("tips.top_up_wallet.label2")} />
                  </a>,
                ]}
              />
            )}
            {hasTip("pin") && (
              <CloseableCard
                handleClose={() =>
                  updateSetting({ tips: tips.filter((tip) => tip !== "pin") })
                }
                title={t("tips.pin.title")}
                description={[
                  t("tips.pin.description1"),
                  t("tips.pin.description2"),
                  t("tips.pin.description3"),
                ]}
              />
            )}
            {hasTip("demo") && (
              <CloseableCard
                handleClose={() =>
                  updateSetting({ tips: tips.filter((tip) => tip !== "demo") })
                }
                title={t("tips.demo.title")}
                description={t("tips.demo.description")}
                buttons={[
                  <Button key={1} label={t("tips.demo.label1")} primary />,
                ]}
              />
            )}
            {hasTip("address") && (
              <CloseableCard
                handleClose={() =>
                  updateSetting({
                    tips: tips.filter((tip) => tip !== "address"),
                  })
                }
                title={t("tips.address.title")}
                description={t("tips.address.description")}
                buttons={[
                  <a key={1} href="https://getalby.com/demo">
                    <Button label={t("tips.address.label1")} primary />
                  </a>,
                ]}
              />
            )}
          </div>
        </>
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
              {t(`suggestions.list.${title as "trading"}`)}
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
