import Button from ".";

export const Default = () => <Button label="Button" />;
export const Primary = () => <Button label="Button" primary />;
export const Loading = () => (
  <div className="space-x-3">
    <Button label="Button" loading />
    <Button label="Button" primary loading />
  </div>
);
export const Disabled = () => (
  <div className="space-x-3">
    <Button label="Button" loading disabled />
    <Button label="Button" primary loading disabled />
  </div>
);

export default {
  title: "Components/Buttons/Button",
  component: Button,
};
