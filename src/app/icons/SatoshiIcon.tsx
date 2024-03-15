import { SVGProps } from "react";

const SatoshiIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M12.75 18.5V21h-1.5v-2.5h1.5zM17 16.75H7v-1.5h10v1.5zm0-4H7v-1.5h10v1.5zm0-4H7v-1.5h10v1.5zM12.75 3v2.5h-1.5V3h1.5z" />
  </svg>
);

export default SatoshiIcon;
