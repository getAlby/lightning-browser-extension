import React from "react";
import { BellIcon, RssIcon } from "@heroicons/react/solid";

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
    icon: RssIcon,
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
