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
    <>
      <div className="overflow-hidden rounded-full">
        <svg
          ref={svgRef}
          width={props.size}
          height={props.size}
          viewBox={`0 0 ${props.size} ${props.size}`}
          xmlns="http://www.w3.org/2000/svg"
        />
      </div>
    </>
  );
};

export default Avatar;
