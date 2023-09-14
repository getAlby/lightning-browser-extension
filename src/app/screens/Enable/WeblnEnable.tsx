import Enable from "~/app/components/Enable";
import { OriginData } from "~/types";

type Props = {
  origin: OriginData;
};

export default function WeblnEnable(props: Props) {
  return <Enable origin={props.origin} />;
}
