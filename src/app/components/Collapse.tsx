import React, { useState, useEffect, useRef } from "react";

type Props = {
  isOpen: boolean;
  children: React.ReactNode;
};

function Collapse({ isOpen = false, children }: Props) {
  const contentEl = useRef<HTMLDivElement>(null);
  const [childHeight, setChildHeight] = useState(0);

  useEffect(() => {
    if (contentEl.current && contentEl.current.clientHeight !== childHeight) {
      setChildHeight(contentEl.current.clientHeight);
    }
  }, [isOpen, childHeight]);

  return (
    <div
      className="collapse transition-all duration-300 overflow-hidden"
      style={{
        maxHeight: isOpen ? `${childHeight}px` : 0,
      }}
    >
      <div className="overflow-auto" ref={contentEl}>
        {children}
      </div>
    </div>
  );
}

export default Collapse;
