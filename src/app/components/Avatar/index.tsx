import { useEffect, useRef } from "react";
import { generateSvgGAvatar } from "~/app/components/Avatar/generator";
import { classNames } from "~/app/utils";

type Props = {
  name: string;
  size: number;
  url?: string;
  className?: string;
};

const Avatar = (props: Props) => {
  if (props.url) {
    return <AvatarImage {...props} />;
  } else {
    return <AvatarSVG {...props} />;
  }
};

// Use object-cover to support non-square avatars that might be loaded by
// different connectors
const AvatarImage = (props: Props) => {
  return (
    <div
      className={classNames("shrink-0", props.className ?? "")}
      style={{
        width: `${props.size}px`,
        height: `${props.size}px`,
      }}
    >
      <img
        className="rounded-full object-cover w-full h-full"
        src={props.url}
      />
    </div>
  );
};
const AvatarSVG = (props: Omit<Props, "url">) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      const svgElement = svgRef.current;
      svgElement.appendChild(
        generateSvgGAvatar(props.name, {
          size: props.size,
        })
      );
    }
  }, [props.name, props.size]);

  return (
    <svg
      className={classNames(
        "rounded-full overflow-hidden shrink-0",
        props.className ?? ""
      )}
      ref={svgRef}
      width={props.size}
      height={props.size}
      viewBox={`0 0 ${props.size} ${props.size}`}
      xmlns="http://www.w3.org/2000/svg"
    />
  );
};

export default Avatar;
