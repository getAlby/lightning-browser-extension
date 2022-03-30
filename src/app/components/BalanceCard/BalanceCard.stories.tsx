import BalanceCard from ".";

const metadata = {
  title: "Components/BalanceCard",
  component: BalanceCard,
};

export default metadata;

export const Default = () => (
  <BalanceCard alias="Wallet name" crypto="₿1.6240 2785" fiat="€ 32,480.56" />
);

export const Loading = () => <BalanceCard alias="" crypto="" fiat={""} />;
