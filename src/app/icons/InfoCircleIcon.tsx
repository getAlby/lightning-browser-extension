import { SVGProps } from "react";

export default function InfoCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M17.7624 3.8434L17.7641 3.84383C23.9344 5.36006 27.6889 11.614 26.1581 17.7753C24.6235 23.9324 18.3874 27.692 12.2193 26.1565C6.06204 24.6169 2.30913 18.3808 3.84344 12.2247C5.37819 6.06695 11.6108 2.30831 17.7624 3.8434Z"
        stroke="currentColor"
      />
      <path d="M15 13.5V20.5" stroke="currentColor" strokeLinecap="round" />
      <path d="M15 11V10" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}
