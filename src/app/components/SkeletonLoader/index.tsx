import Skeleton from "react-loading-skeleton";
import { classNames } from "~/app/utils";

export type Props = {
  circle?: boolean;
  className?: string;
  containerClassName?: string;
  opaque?: boolean;
};

function SkeletonLoader({
  className,
  containerClassName,
  circle,
  opaque = true,
}: Props) {
  return (
    <Skeleton
      baseColor="#AAA"
      highlightColor="#FFF"
      className={classNames(opaque ? "opacity-20" : "", className ?? "")}
      containerClassName={containerClassName}
      circle={circle}
    />
  );
}

export default SkeletonLoader;
