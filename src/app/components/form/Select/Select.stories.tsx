import Select from ".";

export const Primary = () => (
  <Select
    name="user"
    value=""
    onChange={() => {
      console.info("changed");
    }}
  >
    <option>Lorem ipsum</option>
    <option>Dolor sit</option>
    <option>Amet</option>
  </Select>
);

export default {
  title: "Components/Form/Select",
  component: Select,
};
