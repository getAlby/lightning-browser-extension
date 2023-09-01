import Progressbar from "@components/Progressbar";
import SitePreferences from "@components/SitePreferences";
import { useTranslation } from "react-i18next";
import BadgesList from "~/app/components/BadgesList";
import { useSettings } from "~/app/context/SettingsContext";
import { Allowance } from "~/types";

// TODO: if no image set use image based on i.e. domain
const DEFAULT_IMAGE =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns%3Adc%3D%22http%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F%22%20xmlns%3Acc%3D%22http%3A%2F%2Fcreativecommons.org%2Fns%23%22%20xmlns%3Ardf%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%22%20xmlns%3Asvg%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2050%2050%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20width%3D%2260%22%20height%3D%2260%22%3E%3Cmetadata%3E%3Crdf%3ARDF%3E%3Ccc%3AWork%3E%3Cdc%3Aformat%3Eimage%2Fsvg%2Bxml%3C%2Fdc%3Aformat%3E%3Cdc%3Atype%20rdf%3Aresource%3D%22http%3A%2F%2Fpurl.org%2Fdc%2Fdcmitype%2FStillImage%22%2F%3E%3Cdc%3Atitle%3EJdenticon%3C%2Fdc%3Atitle%3E%3Cdc%3Acreator%3E%3Ccc%3AAgent%3E%3Cdc%3Atitle%3EDaniel%20Mester%20Pirttij%C3%A4rvi%3C%2Fdc%3Atitle%3E%3C%2Fcc%3AAgent%3E%3C%2Fdc%3Acreator%3E%3Cdc%3Asource%3Ehttps%3A%2F%2Fgithub.com%2Fdmester%2Fjdenticon%3C%2Fdc%3Asource%3E%3Ccc%3Alicense%20rdf%3Aresource%3D%22https%3A%2F%2Fgithub.com%2Fdmester%2Fjdenticon%2Fblob%2Fmaster%2FLICENSE%22%2F%3E%3C%2Fcc%3AWork%3E%3C%2Frdf%3ARDF%3E%3C%2Fmetadata%3E%3Crect%20fill%3D%22transparent%22%20width%3D%2250%22%20height%3D%2250%22%20x%3D%220%22%20y%3D%220%22%2F%3E%3Cpath%20fill%3D%22%23329948%22%20d%3D%22M13%2013L13%201L25%201ZM25%201L37%201L37%2013ZM37%2037L37%2049L25%2049ZM25%2049L13%2049L13%2037ZM1%2025L1%2013L13%2013ZM37%2013L49%2013L49%2025ZM49%2025L49%2037L37%2037ZM13%2037L1%2037L1%2025Z%22%2F%3E%3Cpath%20fill%3D%22%2366cc7b%22%20d%3D%22M1%2013L1%201L13%201ZM37%201L49%201L49%2013ZM49%2037L49%2049L37%2049ZM13%2049L1%2049L1%2037ZM13%2013L25%2013L25%2025L13%2025ZM16%2020.5L20.5%2025L25%2020.5L20.5%2016ZM37%2013L37%2025L25%2025L25%2013ZM29.5%2016L25%2020.5L29.5%2025L34%2020.5ZM37%2037L25%2037L25%2025L37%2025ZM34%2029.5L29.5%2025L25%2029.5L29.5%2034ZM13%2037L13%2025L25%2025L25%2037ZM20.5%2034L25%2029.5L20.5%2025L16%2029.5Z%22%2F%3E%3C%2Fsvg%3E";

export type Props = {
  onEdit: () => void;
  onDelete: () => void;
  allowance: Allowance;
  title?: string;
  image?: string;
  description?: string;
  url?: string;
  isCard?: boolean;
  isSmall?: boolean;
  children?: React.ReactNode;
};

export default function PublisherPanel({
  allowance,
  onEdit,
  onDelete,
  title,
  image,
  description,
  url,
  isCard = true,
  isSmall = true,
  children,
}: Props) {
  if (!title) {
    title = description;
    description = undefined;
  }
  const { getFormattedSats, getFormattedNumber } = useSettings();
  const { t } = useTranslation("translation", { keyPrefix: "home" });

  const hasBudget = +allowance.totalBudget > 0;
  return (
    <div className="flex justify-center bg-white dark:bg-surface-01dp">
      <div className="flex flex-row max-w-screen-lg mx-auto w-full py-8 px-4 gap-8">
        <div className="flex flex-col gap-4 w-full md:w-[356px]">
          <div className="flex flex-row gap-4">
            {image && (
              <div className="shrink-0">
                <img
                  className="rounded-md w-16 h-16"
                  src={image || DEFAULT_IMAGE}
                  alt={`${title} logo`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = DEFAULT_IMAGE;
                  }}
                />
              </div>
            )}
            <div className="flex flex-col overflow-hidden">
              <h2
                title={title}
                className="font-semibold dark:text-white overflow-hidden text-ellipsis whitespace-nowrap leading-1 text-3xl"
              >
                {title}
              </h2>
              {url && (
                <a
                  href={`https://${url}`}
                  title={url}
                  target="_blank"
                  className="text-gray-500 dark:text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap leading-1 text-lg"
                  rel="noreferrer noopener"
                >
                  {url}
                </a>
              )}
              {!url && description && (
                <p
                  title={description}
                  className={
                    "text-gray-500 dark:text-gray-400 line-clamp-2" +
                    (isSmall ? " -mt-1" : " mb-2")
                  }
                >
                  {description}
                </p>
              )}
            </div>
          </div>
          <div>
            <SitePreferences
              launcherType="button"
              allowance={allowance}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </div>
        <div className="flex-1 flex-col gap-3 hidden md:flex">
          <div className="flex flex-row">
            <div className="flex-1">
              <dt className="text-sm text-gray-500">
                {t("allowance_view.total_spent")}
              </dt>
              <dd className="text-lg dark:text-neutral-400">
                {getFormattedSats(allowance.paymentsAmount)}
              </dd>
            </div>
            <div className="w-64">
              <dt className="text-sm text-gray-500">
                {t("allowance_view.total_payments")}
              </dt>
              <dd className="dark:text-neutral-400">
                {allowance.payments.length}
              </dd>
            </div>
          </div>
          <div className="flex flex-row">
            <div className="flex-1">
              <dt className="text-sm text-gray-500">
                {t("allowance_view.budget_spent")}
              </dt>
              {hasBudget ? (
                <>
                  <dd className="text-sm dark:text-neutral-400">
                    {getFormattedNumber(allowance.usedBudget)} /{" "}
                    {getFormattedNumber(allowance.totalBudget)}{" "}
                    {t("allowance_view.sats")}
                  </dd>
                  <div className="w-64">
                    <Progressbar percentage={allowance.percentage} />
                  </div>
                </>
              ) : (
                <dd className="mt-2 text-sm">
                  <SitePreferences
                    launcherType="hyperlink"
                    allowance={allowance}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </dd>
              )}
            </div>
            <div className="w-64">
              <dt className="text-sm text-gray-500 mb-1">
                {t("allowance_view.permissions")}
              </dt>
              <dd>
                <BadgesList allowance={allowance} />
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
