import Loading from ".";

const metadata = {
  title: "Components/Loading",
  component: Loading,
};

export default metadata;

export const Default = () => (
  <div>
    <div className="p-4">
      <Loading />
    </div>
    <div className="inline-block p-4 bg-orange-bitcoin">
      <Loading color="white" />
    </div>
  </div>
);
