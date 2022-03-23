import Radio from ".";

export const Primary = () => (
  <Radio
    options={[
      {
        speed: "High",
        time: "10 - 20 minutes",
        value: "₿ 0.00001000",
      },
    ]}
  />
);

export default {
  title: "Components/Form/Radio",
  component: Radio,
};
