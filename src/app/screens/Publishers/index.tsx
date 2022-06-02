import Container from "@components/Container";
import PublishersTable from "@components/PublishersTable";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import utils from "~/common/lib/utils";
import { Allowance } from "~/types";

import websites from "./websites.json";

function Publishers() {
  const [data, setData] = useState<Allowance[]>([]);
  const navigate = useNavigate();

  function navigateToPublisher(id: string) {
    navigate(`/publishers/${id}`);
  }

  async function fetchData() {
    try {
      const response = await utils.call<{
        allowances: Allowance[];
      }>("listAllowances");
      const allowances = response.allowances.map((allowance) => {
        if (allowance.enabled && allowance.remainingBudget > 0) {
          return {
            ...allowance,
            badge: {
              label: "ACTIVE",
              color: "green-bitcoin",
              textColor: "white",
            },
          };
        }
        return allowance;
      });
      setData(allowances);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container>
      <h2 className="mt-12 mb-2 text-2xl font-bold dark:text-white">
        Your ⚡️ Websites
      </h2>
      <p className="mb-6 text-gray-700 dark:text-gray-500">
        Websites where you have used Alby before
      </p>
      {data.length > 0 ? (
        <PublishersTable
          publishers={data}
          navigateToPublisher={navigateToPublisher}
        />
      ) : (
        <p className="dark:text-white">No websites yet.</p>
      )}
      <h2 className="mt-12 mb-2 text-2xl font-bold dark:text-white">
        Other ⚡️ Websites
      </h2>
      <p className="mb-6 text-gray-700 dark:text-gray-500">
        Websites where you can use Alby
      </p>
      <div className="mb-12">
        {websites.map(({ title, items }) => (
          <div className="mb-6" key={title}>
            <h4 className="mb-4 text-xl font-bold dark:text-white">{title}</h4>
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
                        <p className="font-serif text-sm font-normal text-gray-700 dark:text-gray-500 line-clamp-3">
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
