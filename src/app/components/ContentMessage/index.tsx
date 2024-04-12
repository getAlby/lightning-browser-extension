type Props = {
  heading: string | React.ReactNode;
  content?: string;
};

function ContentMessage({ heading, content }: Props) {
  return (
    <>
      <dl className="my-4 overflow-hidden">
        <dt className="dark:text-white">{heading}</dt>
        {content && (
          <dd className="text-gray-500 dark:text-gray-400 break-all">
            {content}
          </dd>
        )}
      </dl>
    </>
  );
}

export default ContentMessage;
