import { CaretLeftIcon } from "@bitcoin-design/bitcoin-icons-react/filled";

import IconButton from ".";
import { toast } from "react-toastify";

export const Default = () => (
  <IconButton
    onClick={() => toast.success("Go back")}
    icon={<CaretLeftIcon className="w-4 h-4" />}
  />
);

const metadata = {
  title: "Components/Buttons/IconButton",
  component: IconButton,
};

export default metadata;
