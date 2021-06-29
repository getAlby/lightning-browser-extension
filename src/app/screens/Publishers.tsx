import React, { useState, useEffect } from "react";

import PublishersTable from "../components/PublishersTable";
import Searchbar from "../components/Searchbar";

import utils from "../../common/lib/utils";

function Publishers() {
  const [data, setData] = useState([]);

  const deletePublisher = async (id) => {
    await utils.call("deleteAllowance", { id });
    fetchData();
  };
  async function fetchData() {
    try {
      const response = await utils.call("listAllowances");
      const allowances = response.allowances.map((allowance) => {
        if (allowance.enabled && allowance.remainingBudget > 0) {
          allowance.badge = { label: "ACTIVE", color: "green-bitcoin", textColor: "white" };
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
    <>
      <h2 className="mt-12 mb-6 text-2xl font-bold">
        Manage Publishers & Allowances
      </h2>

      <div className="pb-1 border-b border-grey-200">
        <Searchbar />
      </div>

      <PublishersTable publishers={data} deletePublisher={deletePublisher} />
    </>
  );
}

export default Publishers;
