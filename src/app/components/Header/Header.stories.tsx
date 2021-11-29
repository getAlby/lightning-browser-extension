import { CaretLeftIcon } from "@bitcoin-design/bitcoin-icons-react/filled";

import Header from ".";
import IconButton from "../IconButton";

export const Default = () => (
  <Header
    headerLeft={
      <IconButton
        onClick={() => alert("Go back")}
        icon={<CaretLeftIcon className="w-4 h-4" />}
      />
    }
    title="Header bar"
  />
);

export default {
  title: "Components/Header",
  component: Header,
};
