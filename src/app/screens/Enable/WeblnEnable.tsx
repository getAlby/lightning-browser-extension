import WeblnEnableComponent from "~/app/components/Enable/WeblnEnable";
import { OriginData } from "~/types";

type Props = {
  origin: OriginData;
};

export default function WeblnEnable(props: Props) {
  return <WeblnEnableComponent origin={props.origin} />;
}
