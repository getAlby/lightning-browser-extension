import { Publisher } from "~/types";

import PublishersTable from ".";

const publishers: Publisher[] = [
  {
    id: 1,
    name: "Imagine Bitcoin 2140",
    host: "stacker.news",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    percentage: "60%",
    imageURL: "https://i.ibb.co/c2zYsVy/Ellipse.png",
    paymentsCount: 2,
    paymentsAmount: 100,
    totalBudget: 0,
    usedBudget: 0,
    payments: [],
  },
  {
    id: 2,
    name: "Imagine Bitcoin 2140",
    host: "stacker.news",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    percentage: "60%",
    imageURL: "https://i.ibb.co/c2zYsVy/Ellipse.png",
    paymentsCount: 2,
    paymentsAmount: 100,
    totalBudget: 0,
    usedBudget: 0,
    payments: [],
  },
];

export const Primary = () => (
  <PublishersTable
    publishers={publishers}
    navigateToPublisher={() =>
      window.alert("I should navigate to the publisher")
    }
  />
);

export default {
  title: "Components/PublishersTable",
  component: PublishersTable,
};
