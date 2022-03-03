import Progressbar from ".";

export const Primary = () => (
  <div className="space-y-6">
    <Progressbar percentage="0" />
    <Progressbar percentage="25" />
    <Progressbar percentage="50" />
    <Progressbar percentage="75" />
    <Progressbar percentage="100" />
  </div>
);

export default {
  title: "Components/Progressbar",
  component: Progressbar,
};
