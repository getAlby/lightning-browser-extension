import { CaretLeftIcon } from "@bitcoin-design/bitcoin-icons-react/filled";

import IconButton from ".";

export const Default = () => (
  <IconButton
    onClick={() => alert("Go back")}
    icon={<CaretLeftIcon className="w-4 h-4" />}
  />
);

const metadata = {
  title: "Components/Buttons/IconButton",
  component: IconButton,
};

export default metadata;
