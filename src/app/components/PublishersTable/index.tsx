import { CaretRightIcon } from "@bitcoin-design/bitcoin-icons-react/filled";

import Badge from "../Badge";
import Progressbar from "../Progressbar";

type Publisher = {
  id: string;
  imageURL?: string;
  host: string;
  name: string;
  badge?: {
    label: string;
    color: string;
    textColor: string;
  };
  paymentsCount: number;
  totalBudget: number;
  usedBudget: number;
  percentage: string;
};

type Props = {
  publishers: Publisher[];
  navigateToPublisher: (id: string) => void;
};

const DEFAULT_IMAGE =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns%3Adc%3D%22http%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F%22%20xmlns%3Acc%3D%22http%3A%2F%2Fcreativecommons.org%2Fns%23%22%20xmlns%3Ardf%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%22%20xmlns%3Asvg%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2050%2050%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20width%3D%2260%22%20height%3D%2260%22%3E%3Cmetadata%3E%3Crdf%3ARDF%3E%3Ccc%3AWork%3E%3Cdc%3Aformat%3Eimage%2Fsvg%2Bxml%3C%2Fdc%3Aformat%3E%3Cdc%3Atype%20rdf%3Aresource%3D%22http%3A%2F%2Fpurl.org%2Fdc%2Fdcmitype%2FStillImage%22%2F%3E%3Cdc%3Atitle%3EJdenticon%3C%2Fdc%3Atitle%3E%3Cdc%3Acreator%3E%3Ccc%3AAgent%3E%3Cdc%3Atitle%3EDaniel%20Mester%20Pirttij%C3%A4rvi%3C%2Fdc%3Atitle%3E%3C%2Fcc%3AAgent%3E%3C%2Fdc%3Acreator%3E%3Cdc%3Asource%3Ehttps%3A%2F%2Fgithub.com%2Fdmester%2Fjdenticon%3C%2Fdc%3Asource%3E%3Ccc%3Alicense%20rdf%3Aresource%3D%22https%3A%2F%2Fgithub.com%2Fdmester%2Fjdenticon%2Fblob%2Fmaster%2FLICENSE%22%2F%3E%3C%2Fcc%3AWork%3E%3C%2Frdf%3ARDF%3E%3C%2Fmetadata%3E%3Crect%20fill%3D%22transparent%22%20width%3D%2250%22%20height%3D%2250%22%20x%3D%220%22%20y%3D%220%22%2F%3E%3Cpath%20fill%3D%22%23329948%22%20d%3D%22M13%2013L13%201L25%201ZM25%201L37%201L37%2013ZM37%2037L37%2049L25%2049ZM25%2049L13%2049L13%2037ZM1%2025L1%2013L13%2013ZM37%2013L49%2013L49%2025ZM49%2025L49%2037L37%2037ZM13%2037L1%2037L1%2025Z%22%2F%3E%3Cpath%20fill%3D%22%2366cc7b%22%20d%3D%22M1%2013L1%201L13%201ZM37%201L49%201L49%2013ZM49%2037L49%2049L37%2049ZM13%2049L1%2049L1%2037ZM13%2013L25%2013L25%2025L13%2025ZM16%2020.5L20.5%2025L25%2020.5L20.5%2016ZM37%2013L37%2025L25%2025L25%2013ZM29.5%2016L25%2020.5L29.5%2025L34%2020.5ZM37%2037L25%2037L25%2025L37%2025ZM34%2029.5L29.5%2025L25%2029.5L29.5%2034ZM13%2037L13%2025L25%2025L25%2037ZM20.5%2034L25%2029.5L20.5%2025L16%2029.5Z%22%2F%3E%3C%2Fsvg%3E";

export default function PublishersTable({
  publishers,
  navigateToPublisher,
}: Props) {
  return (
    <div className="shadow overflow-hidden rounded-lg">
      <table className="min-w-full">
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800">
          {publishers.map((publisher) => (
            <tr
              key={publisher.id}
              className="cursor-pointer hover:bg-gray-50 transition duration-200 dark:hover:bg-gray-700"
              onClick={() => navigateToPublisher(publisher.id)}
            >
              <td className="px-4 py-6 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <img
                      className="h-12 w-12 object-cover rounded-full shadow-lg"
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
                      {publisher.badge && (
                        <Badge
                          label={publisher.badge.label}
                          color={publisher.badge.color}
                          textColor={publisher.badge.textColor}
                        />
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {publisher.host} · {publisher.paymentsCount} payments
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-6 whitespace-nowrap text-right">
                {publisher.totalBudget > 0 && (
                  <div className="ml-40">
                    <p className="text-lg text-gray-700 mb-0 dark:text-gray-400">
                      {publisher.usedBudget} / {publisher.totalBudget} sat used
                    </p>
                    <div className="relative mt-2 ml-auto">
                      <div className="flex items-center justify-end">
                        <div className="w-40">
                          <Progressbar percentage={publisher.percentage} />
                        </div>
                        <span
                          className={`ml-2 text-sm font-semibold text-blue-500`}
                        >
                          {publisher.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </td>
              <td className="w-10">
                <CaretRightIcon className="h-6 w-6 text-gray-500" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
