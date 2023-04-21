import Container from "@components/Container";
import { useTranslation } from "react-i18next";
import Tips from "~/app/components/Tips";
import { useTips } from "~/app/hooks/useTips";

import websites from "./websites.json";

function Discover() {
  const { tips } = useTips();
  const { t } = useTranslation("translation");

  return (
    <Container>
      {tips.length > 0 && (
        <>
          <h2 className="mt-12 mb-2 text-2xl font-bold dark:text-white">
            {t("discover.tips.title")}
          </h2>
          <p className="mb-6 text-gray-500 dark:text-neutral-500">
            {t("discover.tips.description")}
          </p>
          <div className="mb-6 grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            <Tips />
          </div>
        </>
      )}

      <h2 className="mt-12 mb-2 text-2xl font-bold dark:text-white">
        {t("discover.title")}
      </h2>

      <p className="mb-6 text-gray-500 dark:text-neutral-500">
        {t("discover.description")}
      </p>

      <div>
        {websites.map(({ title, items }, index) => (
          <div
            className={index !== websites.length - 1 ? "mb-10" : ""}
            key={title}
          >
            <h4 className="mb-2 text-xl font-bold dark:text-white">
              {t(`discover.list.${title as "trading"}`)}
            </h4>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map(({ title, subtitle, logo, url }) => (
                <a key={url} href={url} target="_blank" rel="noreferrer">
                  <div className="bg-white dark:bg-surface-02dp shadow flex p-4 h-24 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer w-full">
                    <div className="flex space-x-3">
                      <img
                        src={logo}
                        alt="image"
                        className="h-14 w-14 rounded-lg object-cover"
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

export default Discover;
