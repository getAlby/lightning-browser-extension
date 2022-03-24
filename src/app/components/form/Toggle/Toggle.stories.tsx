import { useState } from "react";

import Toggle from ".";

export const Primary = () => {
  const [checked, setChecked] = useState(true);
  return <Toggle checked={checked} onChange={setChecked} />;
};

export default {
  title: "Components/Form/Toggle",
  component: Toggle,
};
