import CaretLeftIcon from "@bitcoin-design/bitcoin-icons/svg/filled/caret-left.svg";

import IconButton from ".";

export const Default = () => (
  <IconButton
    onClick={() => alert("Go back")}
    icon={
      <img className="w-4 h-4" src={CaretLeftIcon} alt="" aria-hidden="true" />
    }
  />
);

const metadata = {
  title: "Components/Buttons/IconButton",
  component: IconButton,
};

export default metadata;
