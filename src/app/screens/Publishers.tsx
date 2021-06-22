import React from "react";

import PublishersTable from "../components/PublishersTable";
import Searchbar from "../components/Searchbar";

const publishers = [
  {
    id: "pub_id1",
    name: "Imagine Bitcoin 2140",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    percentage: "60%",
    image: "https://picsum.photos/id/10/200",
  },
  {
    id: "pub_id2",
    name: "Imagine Bitcoin 2140",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    percentage: "60%",
    image: "https://picsum.photos/id/11/200",
  },
  {
    id: "pub_id3",
    name: "Imagine Bitcoin 2140",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    percentage: "60%",
    image: "https://picsum.photos/id/12/200",
  },
  {
    id: "pub_id4",
    name: "Imagine Bitcoin 2140",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    percentage: "60%",
    image: "https://picsum.photos/id/13/200",
  },
  {
    id: "pub_id5",
    name: "Imagine Bitcoin 2140",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    percentage: "60%",
    image: "https://picsum.photos/id/14/200",
  },
  {
    id: "pub_id6",
    name: "Imagine Bitcoin 2140",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    percentage: "60%",
    image: "https://picsum.photos/id/15/200",
  },
  {
    id: "pub_id7",
    name: "Imagine Bitcoin 2140",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    percentage: "60%",
    image: "https://picsum.photos/id/16/200",
  },
  {
    id: "pub_id8",
    name: "Imagine Bitcoin 2140",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    percentage: "60%",
    image: "https://picsum.photos/id/17/200",
  },
];

function Publishers() {
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
