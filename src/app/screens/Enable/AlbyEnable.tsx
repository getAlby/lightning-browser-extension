import Enable from "~/app/components/Enable";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { OriginData } from "~/types";

export default function AlbyEnable() {
  const navState = useNavigationState();
  const origin = navState.origin as OriginData;
  return <Enable origin={origin} />;
}
