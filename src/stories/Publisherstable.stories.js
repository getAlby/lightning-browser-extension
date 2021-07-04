import React from "react";
import PublishersTable from "../app/components/PublishersTable";

const publishers = [
  {
    name: "Imagine Bitcoin 2140",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    percentage: "60%",
    image: "https://i.ibb.co/c2zYsVy/Ellipse.png",
  },
  {
    name: "Imagine Bitcoin 2140",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    percentage: "60%",
    image: "https://i.ibb.co/c2zYsVy/Ellipse.png",
  },
];

export const Primary = () => <PublishersTable publishers={publishers} />;

export default {
  title: "Components/PublishersTable",
  component: PublishersTable,
};
