import AlbyEnableComponent from "~/app/components/Enable/AlbyEnable";
import { OriginData } from "~/types";

type Props = {
  origin: OriginData;
};

export default function AlbyEnable(props: Props) {
  return <AlbyEnableComponent origin={props.origin} />;
}
