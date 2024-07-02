import { PopiconsChevronRightLine } from "@popicons/react";
import { useTranslation } from "react-i18next";
import BadgesList from "~/app/components/BadgesList";
import { useSettings } from "~/app/context/SettingsContext";
import { Allowance } from "~/types";

type Props = {
  allowances: Allowance[];
  navigateToPublisher: (id: number) => void;
};

const DEFAULT_IMAGE =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns%3Adc%3D%22http%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F%22%20xmlns%3Acc%3D%22http%3A%2F%2Fcreativecommons.org%2Fns%23%22%20xmlns%3Ardf%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%22%20xmlns%3Asvg%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2050%2050%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20width%3D%2260%22%20height%3D%2260%22%3E%3Cmetadata%3E%3Crdf%3ARDF%3E%3Ccc%3AWork%3E%3Cdc%3Aformat%3Eimage%2Fsvg%2Bxml%3C%2Fdc%3Aformat%3E%3Cdc%3Atype%20rdf%3Aresource%3D%22http%3A%2F%2Fpurl.org%2Fdc%2Fdcmitype%2FStillImage%22%2F%3E%3Cdc%3Atitle%3EJdenticon%3C%2Fdc%3Atitle%3E%3Cdc%3Acreator%3E%3Ccc%3AAgent%3E%3Cdc%3Atitle%3EDaniel%20Mester%20Pirttij%C3%A4rvi%3C%2Fdc%3Atitle%3E%3C%2Fcc%3AAgent%3E%3C%2Fdc%3Acreator%3E%3Cdc%3Asource%3Ehttps%3A%2F%2Fgithub.com%2Fdmester%2Fjdenticon%3C%2Fdc%3Asource%3E%3Ccc%3Alicense%20rdf%3Aresource%3D%22https%3A%2F%2Fgithub.com%2Fdmester%2Fjdenticon%2Fblob%2Fmaster%2FLICENSE%22%2F%3E%3C%2Fcc%3AWork%3E%3C%2Frdf%3ARDF%3E%3C%2Fmetadata%3E%3Crect%20fill%3D%22transparent%22%20width%3D%2250%22%20height%3D%2250%22%20x%3D%220%22%20y%3D%220%22%2F%3E%3Cpath%20fill%3D%22%23329948%22%20d%3D%22M13%2013L13%201L25%201ZM25%201L37%201L37%2013ZM37%2037L37%2049L25%2049ZM25%2049L13%2049L13%2037ZM1%2025L1%2013L13%2013ZM37%2013L49%2013L49%2025ZM49%2025L49%2037L37%2037ZM13%2037L1%2037L1%2025Z%22%2F%3E%3Cpath%20fill%3D%22%2366cc7b%22%20d%3D%22M1%2013L1%201L13%201ZM37%201L49%201L49%2013ZM49%2037L49%2049L37%2049ZM13%2049L1%2049L1%2037ZM13%2013L25%2013L25%2025L13%2025ZM16%2020.5L20.5%2025L25%2020.5L20.5%2016ZM37%2013L37%2025L25%2025L25%2013ZM29.5%2016L25%2020.5L29.5%2025L34%2020.5ZM37%2037L25%2037L25%2025L37%2025ZM34%2029.5L29.5%2025L25%2029.5L29.5%2034ZM13%2037L13%2025L25%2025L25%2037ZM20.5%2034L25%2029.5L20.5%2025L16%2029.5Z%22%2F%3E%3C%2Fsvg%3E";

export default function PublishersTable({
  allowances,
  navigateToPublisher,
}: Props) {
  const { getFormattedSats, getFormattedNumber } = useSettings();
  const { t: tComponents } = useTranslation("components", {
    keyPrefix: "publishers_table",
  });
  const { t: tCommon } = useTranslation("common");

  return (
    <div className="shadow overflow-hidden rounded-lg">
      <table className="min-w-full">
        <tbody className="bg-white divide-y divide-gray-200 dark:divide-white/10 dark:bg-surface-02dp">
          {allowances.map((publisher) => (
            <tr
              key={publisher.id}
              className="cursor-pointer hover:bg-gray-50 transition duration-200 dark:hover:bg-neutral-800"
              onClick={() => navigateToPublisher(publisher.id)}
            >
              <td className="px-4 py-6 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <img
                      className="h-12 w-12 object-cover rounded-lg"
                      src={publisher.imageURL || DEFAULT_IMAGE}
                      alt={publisher.host}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = DEFAULT_IMAGE;
                      }}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-lg inline mr-2 dark:text-white">
                        {publisher.name}
                      </p>
                      <BadgesList allowance={publisher} />
                    </div>
                    <div className="text-sm space-x-2 text-gray-600 dark:text-neutral-400">
                      <span>{publisher.host}</span>
                      <span>•</span>
                      <span>
                        {publisher.paymentsCount} {tComponents("payments")}
                      </span>
                      {publisher.paymentsAmount > 0 && (
                        <>
                          <span>{"•"}</span>
                          <span>
                            {tComponents("total")}{" "}
                            {getFormattedSats(publisher.paymentsAmount)}
                          </span>
                        </>
                      )}
                      {publisher.totalBudget > 0 && (
                        <>
                          <span>{"•"}</span>
                          <span>
                            {tComponents("budget")}{" "}
                            {getFormattedNumber(publisher.usedBudget)} /{" "}
                            {getFormattedNumber(publisher.totalBudget)}{" "}
                            {tCommon("sats", { count: publisher.usedBudget })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td className="w-10">
                <PopiconsChevronRightLine className="h-6 w-6 text-gray-600 dark:text-neutral-400" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
