import React from "react";
import { BellIcon, SofaIcon } from "@bitcoin-design/bitcoin-icons-react/filled";

import CategoriesTable from ".";

let categories = [
  {
    icon: BellIcon,
    name: "Good Life",
    transactionsCount: 23,
    percentage: 20,
    sumvalue: "$1000",
    color: "red-bitcoin",
  },
  {
    icon: SofaIcon,
    name: "Entertainment",
    transactionsCount: 10,
    percentage: 10,
    sumvalue: "$100",
    color: "blue-bitcoin",
  },
];

export const Primary = () => <CategoriesTable categories={categories} />;

export default {
  title: "Components/CategoriesTable",
  component: CategoriesTable,
};
