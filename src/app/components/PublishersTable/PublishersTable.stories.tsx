import PublishersTable from ".";
import { toast } from "react-toastify";

const publishers = [
  {
    id: "1",
    name: "Imagine Bitcoin 2140",
    host: "stacker.news",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    percentage: "60%",
    image: "https://i.ibb.co/c2zYsVy/Ellipse.png",
    paymentsCount: 2,
    paymentsAmount: 100,
    totalBudget: 0,
    usedBudget: 0,
  },
  {
    id: "2",
    name: "Imagine Bitcoin 2140",
    host: "stacker.news",
    title: "Regional Paradigm Technician",
    badge: { label: "ACTIVE", color: "green-bitcoin", textColor: "white" },
    sats: "186,000 / 310,000",
    percentage: "60%",
    image: "https://i.ibb.co/c2zYsVy/Ellipse.png",
    paymentsCount: 2,
    paymentsAmount: 100,
    totalBudget: 0,
    usedBudget: 0,
  },
];

export const Primary = () => (
  <PublishersTable
    publishers={publishers}
    navigateToPublisher={() => toast.warn("I should navigate to the publisher")}
  />
);

export default {
  title: "Components/PublishersTable",
  component: PublishersTable,
};
