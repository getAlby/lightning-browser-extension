import Container from "@components/Container";
import PublishersTable from "@components/PublishersTable";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import utils from "~/common/lib/utils";
import { Allowance, Publisher } from "~/types";

import websites from "./websites.json";

function Publishers() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const navigate = useNavigate();

  function navigateToPublisher(id: string | number) {
    navigate(`/publishers/${id}`);
  }

  async function fetchData() {
    // interface FooAloowance {
    //   id?: number | string;
    //   createdAt: string;
    //   host: string;
    // }

    // interface FooPublisher
    //   extends Pick<Allowance, "host" | "imageURL" | "name"> {
    //   id: number | string;
    // }

    // const fooAllowances: Allowance[] = [
    //   {
    //     id: 1,
    //     createdAt: "blue",
    //     host: "blue",
    //     imageURL: "blue",
    //     name: "blue",
    //   },
    //   {
    //     id: 2,
    //     createdAt: "blue",
    //     host: "blue",
    //     imageURL: "blue",
    //     name: "blue",
    //   },
    //   {
    //     id: 3,
    //     createdAt: "blue",
    //     host: "blue",
    //     imageURL: "blue",
    //     name: "blue",
    //   },
    //   {
    //     createdAt: "blue",
    //     host: "blue",
    //     imageURL: "blue",
    //     name: "blue",
    //   },
    // ];

    // const fooPublishers: FooPublisher[] = fooAllowances.filter(
    //   (allowance): allowance is FooPublisher => !!allowance.id
    // );

    // const tmp: Publisher[] = fooAllowances
    //   .filter(
    //     (allowance) => typeof allowance?.id !== "undefined"
    //     //!!allowance?.id
    //     //  && typeof allowance?.id !== "undefined"
    //   )
    //   .map((allowance): Publisher => {
    //     const id = allowance.id;
    //     return {
    //       host: allowance.host,
    //       id,
    //       imageURL: allowance.imageURL,
    //       name: allowance.name,
    //     };
    //   });

    // const strictTree4 = fooAllowances.reduce<Publisher[]>((acc, allowance) => {
    //   if (!allowance?.id) return acc;
    //   acc.push({
    //     host: allowance.host,
    //     id: allowance.id,
    //     imageURL: allowance.imageURL,
    //     name: allowance.name,
    //   });

    //   return acc;
    // }, []);

    // const fooPublishers: Publisher[] = tmp.length > 0 ? tmp : [];
    // const fooPublishers: Publisher[] = fooAllowances.map(
    //   (allowance) => {
    //     // !!allowance.id
    //     return {
    //       host: allowance.host,
    //       id: "2",
    //       imageURL: allowance.imageURL,
    //       name: allowance.name,
    //     };
    //   }
    // );
    // .map((tree) => ({ ...tree, banana: 1 }));

    // console.log(fooPublishers);

    // const usagePublishers: Publisher[] = fooPublishers;

    try {
      const response = await utils.call<{
        allowances: Allowance[];
      }>("listAllowances");

      // !!allowance.id && allowance.enabled && allowance.remainingBudget > 0

      const resAllowances = response.allowances;

      // const allowances: Publisher[] = resAllowances.filter(
      //   (allowance): allowance is Publisher => !!allowance.id
      // );

      const allowances: Publisher[] = resAllowances.reduce<Publisher[]>(
        (acc, allowance) => {
          if (!allowance?.id) return acc;
          acc.push({
            id: allowance.id,
            host: allowance.host,
            imageURL: allowance.imageURL,
            name: allowance.name,
            payments: allowance.payments,
            paymentsAmount: allowance.paymentsAmount,
            paymentsCount: allowance.paymentsCount,
            percentage: allowance.percentage,
            totalBudget: allowance.totalBudget,
            usedBudget: allowance.usedBudget,
            badge: {
              label: "ACTIVE",
              color: "green-bitcoin",
              textColor: "white",
            },
          });

          return acc;
        },
        []
      );

      // const allowances = response.allowances.reduce<Publisher[]>(
      //   (acc, allowance) => {
      //     if (!allowance?.id) return acc;
      //     acc.push({
      //       host: allowance.host,
      //       id: allowance.id,
      //       imageURL: allowance.imageURL,
      //       name: allowance.name,
      //     });

      //     return acc;
      //   },
      //   []
      // );
      // .map((allowance) => {
      //   return {

      //   };
      // });

      // const allowances: Publisher[] = resAllowances.map(
      //   (allowance): allowance is Publisher => {
      //     if (
      //       !!allowance.id &&
      //       allowance.enabled &&
      //       allowance.remainingBudget > 0
      //     ) {
      //       return {
      //         host: allowance.host,
      //         imageURL: allowance.imageURL,
      //         name: allowance.name,
      //         payments: allowance.payments,
      //         paymentsAmount: allowance.paymentsAmount,
      //         paymentsCount: allowance.paymentsCount,
      //         percentage: allowance.percentage,
      //         totalBudget: allowance.totalBudget,
      //         usedBudget: allowance.usedBudget,
      //       };
      //     } else {
      //       return false;
      //     }
      //   }
      // );

      // .map((allowance) => ({
      //   ...allowance,
      //   badge: {
      //     label: "ACTIVE",
      //     color: "green-bitcoin",
      //     textColor: "white",
      //   },
      // }));

      setPublishers(allowances);
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
      <p className="mb-6 text-gray-500 dark:text-neutral-500">
        Websites where you have used Alby before
      </p>
      {publishers.length > 0 ? (
        <PublishersTable
          publishers={publishers}
          navigateToPublisher={navigateToPublisher}
        />
      ) : (
        <p className="dark:text-white">No websites yet.</p>
      )}
      <h2 className="mt-12 mb-2 text-2xl font-bold dark:text-white">
        Other ⚡️ Websites
      </h2>
      <p className="mb-6 text-gray-500 dark:text-neutral-500">
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
