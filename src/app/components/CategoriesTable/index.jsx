import { CaretRightIcon } from "@bitcoin-design/bitcoin-icons-react/filled";

import Progressbar from "../Progressbar";

export default function CategoriesTable({ categories }) {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.name}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`shrink-0 h-10 w-10 bg-${category.color} rounded-full`}
                        >
                          <category.icon
                            className="h-10 w-10 p-1 text-white"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="ml-4 ">
                          <div className="text-sm font-semibold text-gray-900">
                            <p className="inline mr-2"> {category.name}</p>
                          </div>
                          <div className="text-xs text-gray-500">
                            {category.transactionsCount} transactions
                            <span
                              className={`text-xs font-semibold inline-block text-${category.color} relative top-4`}
                            >
                              {category.percentage}%
                            </span>
                            <div className="relative right-3.5 ml-3 mt-2 w-9/12">
                              <Progressbar percentage={category.percentage} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left">
                      <div className="text-xs text-gray-500">
                        <span
                          className={`text-sm font-semibold inline-block text-${category.color} relative top-6`}
                        >
                          {category.sumvalue}
                        </span>
                        <div className="relative left-10 mt-1">
                          <CaretRightIcon className="h-5 w-5 text-black text-sm font-light" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
