import React from "react";

export function ContentBox({ children }: React.PropsWithChildren<object>) {
  return (
    <div className="mt-6 bg-white rounded-2xl p-10 border border-gray-200 dark:border-neutral-700 dark:bg-surface-01dp flex flex-col gap-8">
      {children}
    </div>
  );
}
