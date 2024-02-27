import Container from "@components/Container";
import Loading from "@components/Loading";
import PublishersTable from "@components/PublishersTable";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Button from "~/app/components/Button";
import toast from "~/app/components/Toast";
import msg from "~/common/lib/msg";
import { Allowance } from "~/types";

function Publishers() {
  const { t } = useTranslation("translation", {
    keyPrefix: "publishers",
  });

  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [publishersLoading, setPublishersLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  function navigateToPublisher(id: number) {
    navigate(`/publishers/${id}`);
  }

  async function fetchData() {
    try {
      const allowanceResponse = await msg.request<{
        allowances: Allowance[];
      }>("listAllowances");
      const allowances = allowanceResponse.allowances.filter(
        (a) => a.id && a.enabled
      );
      setAllowances(allowances);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    } finally {
      setPublishersLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container>
      <h2 className="mt-12 mb-2 text-2xl font-bold dark:text-white">
        {t("title")}
      </h2>

      <p className="mb-6 text-gray-500 dark:text-neutral-500">
        {t("description")}
      </p>

      {publishersLoading ? (
        <div className="flex justify-center mt-12">
          <Loading />
        </div>
      ) : (
        <>
          {allowances.length > 0 ? (
            <PublishersTable
              allowances={allowances}
              navigateToPublisher={navigateToPublisher}
            />
          ) : (
            <>
              <p className="dark:text-white mb-4"> {t("no_info")}</p>
              <Button
                primary
                label={t("discover")}
                onClick={() =>
                  window.open(`https://getalby.com/discover`, "_blank")
                }
              />
            </>
          )}
        </>
      )}
    </Container>
  );
}

export default Publishers;
