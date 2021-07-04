import React, { useState, useEffect, useRef } from "react";

type Props = {
  isOpen: boolean;
  children: React.ReactNode;
};

function Collapse({ isOpen = false, children }: Props) {
  const collapseEl = useRef<HTMLDivElement>(null);
  const contentEl = useRef<HTMLDivElement>(null);
  const [childHeight, setChildHeight] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (contentEl.current && contentEl.current.clientHeight !== childHeight) {
      setChildHeight(contentEl.current.clientHeight);
    }
  }, [isOpen, childHeight]);

  useEffect(() => {
    setIsAnimating(true);
  }, [isOpen]);

  function transitionComplete() {
    setIsAnimating(false);
  }

  useEffect(() => {
    if (collapseEl.current) {
      const el = collapseEl.current;
      el.addEventListener("transitionend", transitionComplete);

      return () => {
        el.removeEventListener("transitionend", transitionComplete);
      };
    }
  }, []);

  return (
    <div
      ref={collapseEl}
      className="collapse transition-all duration-300"
      style={{
        height: isOpen ? `${childHeight}px` : 0,
        overflow: isAnimating || !isOpen ? "hidden" : "visible",
      }}
    >
      <div ref={contentEl}>{children}</div>
    </div>
  );
}

export default Collapse;
