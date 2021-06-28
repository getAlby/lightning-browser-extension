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
    percentage: "20",
    image: "https://picsum.photos/id/10/200",
  },
  {
    id: "pub_id2",
    description: "Art · 12 payments",
    name: "Imagine Bitcoin 2140",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    percentage: "60",
    image: "https://picsum.photos/id/11/200",
  },
  {
    id: "pub_id3",
    description: "Art · 12 payments",
    name: "Imagine Bitcoin 2140",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    percentage: "30",
    image: "https://picsum.photos/id/12/200",
  },
  {
    id: "pub_id4",
    description: "Art · 12 payments",
    name: "Imagine Bitcoin 2140",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    percentage: "10",
    image: "https://picsum.photos/id/13/200",
  },
  {
    id: "pub_id5",
    description: "Art · 12 payments",
    name: "Imagine Bitcoin 2140",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    percentage: "100",
    image: "https://picsum.photos/id/14/200",
  },
  {
    id: "pub_id6",
    description: "Art · 12 payments",
    name: "Imagine Bitcoin 2140",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    percentage: "40",
    image: "https://picsum.photos/id/15/200",
  },
];

function Publishers() {
  const [publishers, setPublishers] = useState([]);

  async function fetchData() {
    try {
      // const data = await getPublishersAsyncFn();
      const data = dummyData;
      setPublishers(data);
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

      <PublishersTable publishers={publishers} />
    </>
  );
}

export default Publishers;
