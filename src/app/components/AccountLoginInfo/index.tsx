import { Popover, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import msg from "~/common/lib/msg";
import { Allowance } from "~/types";

export interface LoginSiteProps {
  accountId: string;
}
const DEFAULT_IMAGE =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns%3Adc%3D%22http%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F%22%20xmlns%3Acc%3D%22http%3A%2F%2Fcreativecommons.org%2Fns%23%22%20xmlns%3Ardf%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%22%20xmlns%3Asvg%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2050%2050%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20width%3D%2260%22%20height%3D%2260%22%3E%3Cmetadata%3E%3Crdf%3ARDF%3E%3Ccc%3AWork%3E%3Cdc%3Aformat%3Eimage%2Fsvg%2Bxml%3C%2Fdc%3Aformat%3E%3Cdc%3Atype%20rdf%3Aresource%3D%22http%3A%2F%2Fpurl.org%2Fdc%2Fdcmitype%2FStillImage%22%2F%3E%3Cdc%3Atitle%3EJdenticon%3C%2Fdc%3Atitle%3E%3Cdc%3Acreator%3E%3Ccc%3AAgent%3E%3Cdc%3Atitle%3EDaniel%20Mester%20Pirttij%C3%A4rvi%3C%2Fdc%3Atitle%3E%3C%2Fcc%3AAgent%3E%3C%2Fdc%3Acreator%3E%3Cdc%3Asource%3Ehttps%3A%2F%2Fgithub.com%2Fdmester%2Fjdenticon%3C%2Fdc%3Asource%3E%3Ccc%3Alicense%20rdf%3Aresource%3D%22https%3A%2F%2Fgithub.com%2Fdmester%2Fjdenticon%2Fblob%2Fmaster%2FLICENSE%22%2F%3E%3C%2Fcc%3AWork%3E%3C%2Frdf%3ARDF%3E%3C%2Fmetadata%3E%3Crect%20fill%3D%22transparent%22%20width%3D%2250%22%20height%3D%2250%22%20x%3D%220%22%20y%3D%220%22%2F%3E%3Cpath%20fill%3D%22%23329948%22%20d%3D%22M13%2013L13%201L25%201ZM25%201L37%201L37%2013ZM37%2037L37%2049L25%2049ZM25%2049L13%2049L13%2037ZM1%2025L1%2013L13%2013ZM37%2013L49%2013L49%2025ZM49%2025L49%2037L37%2037ZM13%2037L1%2037L1%2025Z%22%2F%3E%3Cpath%20fill%3D%22%2366cc7b%22%20d%3D%22M1%2013L1%201L13%201ZM37%201L49%201L49%2013ZM49%2037L49%2049L37%2049ZM13%2049L1%2049L1%2037ZM13%2013L25%2013L25%2025L13%2025ZM16%2020.5L20.5%2025L25%2020.5L20.5%2016ZM37%2013L37%2025L25%2025L25%2013ZM29.5%2016L25%2020.5L29.5%2025L34%2020.5ZM37%2037L25%2037L25%2025L37%2025ZM34%2029.5L29.5%2025L25%2029.5L29.5%2034ZM13%2037L13%2025L25%2025L25%2037ZM20.5%2034L25%2029.5L20.5%2025L16%2029.5Z%22%2F%3E%3C%2Fsvg%3E";

function LoginSite(props: LoginSiteProps) {
  const [Allowances, setAllowances] = useState<Allowance[]>([]);

  const { t } = useTranslation("components", {
    keyPrefix: "account_logininfo",
  });

  async function fetchData(accountId: string) {
    try {
      const allowanceResponse = await msg.request<{
        allowances: Allowance[];
      }>("listAllowances", { accountId: accountId });

      const list: Allowance[] = [];
      allowanceResponse.allowances.forEach((item) => {
        if (item.lnurlAuth) {
          list.push(item);
        }
      });
      setAllowances(list);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  }

  useEffect(() => {
    fetchData(props.accountId);
  }, [props.accountId]);
  return (
    <Popover className="relative">
      <Popover.Button className="group inline-flex items-center text-base   hover:text-opacity-100 focus:outline-none ">
        <div className="mt-1 flex -space-x-4 overflow-hidden ">
          {Allowances.slice(0, 6).map((allowance) => (
            <img
              key={allowance.id}
              className="inline-block h-10 w-10 rounded-full ring-2 ring-transparent"
              src={allowance.imageURL || DEFAULT_IMAGE}
              alt={allowance.host}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = DEFAULT_IMAGE;
              }}
            />
          ))}
        </div>
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute left-1/4 z-10 mt-3 w-screen max-w-sm -translate-x-1/2 transform px-4 sm:px-0 lg:max-w-3xl">
          <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black  ring-opacity-5 bg-white dark:bg-surface-02dp dark:ring-neutral-500">
            <div className="relative ">
              <h2 className="text-center my-2 dark:text-white">{t("title")}</h2>
              <div className="flex  flex-wrap    max-h-64   overflow-y-auto p-7">
                {Allowances.map((allowance) => (
                  <div
                    key={allowance.id}
                    className="basis-1/2  h-18  flex  items-center rounded-lg p-2  hover:bg-gray-50 hover:dark:bg-black "
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center text-white sm:h-12 sm:w-12">
                      <img
                        key={allowance.id}
                        className="inline-block h-10 w-10 rounded-full ring-2 ring-transparent"
                        src={allowance.imageURL || DEFAULT_IMAGE}
                        alt={allowance.host}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = DEFAULT_IMAGE;
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {allowance.name}
                      </p>
                      <p className="text-sm text-gray-500">{allowance.host}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}

export default LoginSite;
