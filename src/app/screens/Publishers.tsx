import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Container from "../components/Container";
import PublishersTable from "../components/PublishersTable";

import { Allowance, Blocklist } from "../../types";
import utils from "../../common/lib/utils";

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
      const response2 = await utils.call<{
        blocklist: Blocklist[];
      }>("listBlocklist");
      const allowances = response.allowances.map((allowance) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let retobj: any = allowance;
        if (allowance.enabled && allowance.remainingBudget > 0) {
          retobj = {
            ...allowance,
            badge: {
              label: "ACTIVE",
              color: "green-bitcoin",
              textColor: "white",
            },
          };
        }
        if (response2.blocklist.find((item) => item.host === allowance.host)) {
          retobj.blocked = true;
        }
        return retobj;
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
      <h2 className="mt-12 mb-6 text-2xl font-bold dark:text-white">
        ⚡️ Websites
      </h2>
      <PublishersTable
        publishers={data}
        navigateToPublisher={navigateToPublisher}
      />
    </Container>
  );
}

export default Publishers;
