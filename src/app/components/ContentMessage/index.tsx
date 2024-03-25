type Props = {
  heading: string | React.ReactNode;
  content: string;
};

function ContentMessage({ heading, content }: Props) {
  return (
    <>
      <dl className="my-4 p-4 shadow bg-white dark:bg-surface-01dp border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden">
        <dt className="font-medium text-sm dark:text-white">{heading}</dt>
        <dd className="text-gray-500 dark:text-gray-400 break-all">
          {content}
        </dd>
      </dl>
    </>
  );
}

export default ContentMessage;
