import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import Container from "../components/Container";
import PublishersTable from "../components/PublishersTable";

import { Allowance } from "../../types";
import utils from "../../common/lib/utils";

function Publishers() {
  const [data, setData] = useState([]);
  const history = useHistory();

  function navigateToPublisher(id: string) {
    history.push(`/publishers/${id}`);
  }

  async function fetchData() {
    try {
      const response = await utils.call("listAllowances");
      const allowances = response.allowances.map((allowance: Allowance) => {
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
      console.error(e);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container>
      <h2 className="mt-12 mb-6 text-2xl font-bold">⚡️Websites</h2>
      <PublishersTable
        publishers={data}
        navigateToPublisher={navigateToPublisher}
      />
    </Container>
  );
}

export default Publishers;
