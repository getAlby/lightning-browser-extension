import React from "react";
import { useParams } from "react-router-dom";

import utils from "../../common/lib/utils";

function Publisher() {
  const { id } = useParams();

  async function fetchData() {
    try {
      const response = await utils.call("listAllowances");
      const allowances = response.allowances.map((allowance) => {
        if (allowance.enabled && allowance.remainingBudget > 0) {
          allowance.badge = {
            label: "ACTIVE",
            color: "green-bitcoin",
            textColor: "white",
          };
        }
        return allowance;
      });
      setData(allowances);
    } catch (e) {
      console.log(e.message);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="mt-12 mb-6 text-2xl font-bold">Publisher {id}</h2>
      <p>Show details from publisher {id}</p>
    </div>
  );
}

export default Publisher;
