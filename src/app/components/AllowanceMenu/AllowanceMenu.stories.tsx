import AllowanceMenu from ".";

export const Default = () => (
  <div className="max-w-xs flex justify-end">
    <AllowanceMenu allowance={{ id: 4, totalBudget: 1000 }} />
  </div>
);

const metadata = {
  title: "Components/AllowanceMenu",
  component: AllowanceMenu,
};

export default metadata;
