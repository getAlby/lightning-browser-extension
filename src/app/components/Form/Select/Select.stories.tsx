import React from "react";

import Select from ".";

export const Primary = () => (
  <Select name="user" value="" onChange={() => {}}>
    <option>Lorem ipsum</option>
    <option>Dolor sit</option>
    <option>Amet</option>
  </Select>
);

export default {
  title: "Components/Form/Select",
  component: Select,
};
