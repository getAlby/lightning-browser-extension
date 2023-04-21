import { useEffect, useRef } from "react";
import { generateSvgGAvatar } from "~/app/components/Avatar/generator";

type Props = {
  name: string;
  size: number;
};

const Avatar = (props: Props) => {
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
      className="rounded-full overflow-hidden"
      style={{
        transform:
          "translateZ(0)" /* Forced GPU render to avoid ugly borders when switching accounts */,
      }}
      ref={svgRef}
      width={props.size}
      height={props.size}
      viewBox={`0 0 ${props.size} ${props.size}`}
      xmlns="http://www.w3.org/2000/svg"
    />
  );
};

export default Avatar;
