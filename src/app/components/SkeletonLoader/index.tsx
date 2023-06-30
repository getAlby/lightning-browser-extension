import Skeleton from "react-loading-skeleton";
import { classNames } from "~/app/utils";

export type Props = {
  className?: string;
  containerClassName?: string;
};

function SkeletonLoader({ className, containerClassName }: Props) {
  return (
    <Skeleton
      className={classNames(className ?? "", "opacity-20")}
      containerClassName={containerClassName}
      baseColor="#AAA"
      highlightColor="#FFF"
    />
  );
}

export default SkeletonLoader;
