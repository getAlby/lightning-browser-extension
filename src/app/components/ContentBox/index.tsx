import React from "react";

export function ContentBox({ children }: React.PropsWithChildren<object>) {
  return (
    <div className="mt-12 shadow bg-white rounded-md p-10 divide-black/10 dark:divide-white/10 dark:bg-surface-02dp flex flex-col gap-4">
      {children}
    </div>
  );
}
