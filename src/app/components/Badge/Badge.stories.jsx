import Badge from ".";

export const Primary = () => (
  <Badge label="ACTIVE" color="green-bitcoin" textColor="white" />
);

export const Small = () => (
  <Badge label="ACTIVE" color="green-bitcoin" textColor="white" small />
);

export default {
  title: "Components/Badge",
  component: Badge,
};
