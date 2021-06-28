import React, { useState, useEffect } from "react";

import PublishersTable from "../components/PublishersTable";
import Searchbar from "../components/Searchbar";

const dummyData = [
  {
    id: "pub_id1",
    description: "Art · 12 payments",
    name: "Imagine Bitcoin 2140",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    spent: 186000,
    total: 310000,
    image: "https://picsum.photos/id/10/200",
  },
  {
    id: "pub_id2",
    description: "Art · 12 payments",
    name: "Imagine Bitcoin 2140",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    spent: 16000,
    total: 310000,
    image: "https://picsum.photos/id/11/200",
  },
  {
    id: "pub_id3",
    description: "Art · 12 payments",
    name: "Imagine Bitcoin 2140",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    spent: 140000,
    total: 310000,
    image: "https://picsum.photos/id/12/200",
  },
  {
    id: "pub_id4",
    description: "Art · 12 payments",
    name: "Imagine Bitcoin 2140",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    spent: 90000,
    total: 310000,
    image: "https://picsum.photos/id/13/200",
  },
  {
    id: "pub_id5",
    description: "Art · 12 payments",
    name: "Imagine Bitcoin 2140",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    spent: 120000,
    total: 310000,
    image: "https://picsum.photos/id/14/200",
  },
  {
    id: "pub_id6",
    description: "Art · 12 payments",
    name: "Imagine Bitcoin 2140",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    spent: 40000,
    total: 310000,
    image: "https://picsum.photos/id/15/200",
  },
];

function Publishers() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // const result = await getPublishersAsyncFunc();
        const result = dummyData;
        const resultWithPercentages = result.map((publisher) => ({
          ...publisher,
          percentage: ((publisher.spent / publisher.total) * 100).toFixed(0),
        }));
        setData(resultWithPercentages);
      } catch (e) {
        console.log(e.message);
      }
    }

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

      <PublishersTable publishers={data} />
    </>
  );
}

export default Publishers;
