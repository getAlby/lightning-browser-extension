import Skeleton from "react-loading-skeleton";
import { classNames } from "~/app/utils";

export type Props = {
  className?: string;
};

function SkeletonLoader({ className }: Props) {
  return (
    <Skeleton
      style={{ opacity: 0.2 }}
      className={classNames(className ?? "", "opacity-20")}
      baseColor="#AAA"
      highlightColor="#FFF"
    />
  );
}

export default SkeletonLoader;
