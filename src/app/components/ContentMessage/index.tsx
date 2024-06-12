type Props = {
  heading: string | React.ReactNode;
  content?: string;
};

function ContentMessage({ heading, content }: Props) {
  return (
    <>
      <dl className="my-4 overflow-hidden">
        <dt className="text-sm text-gray-800 dark:text-neutral-200">
          {heading}
        </dt>
        {content && (
          <dd className="text-lg text-gray-600 dark:text-neutral-400 break-all line-clamp-[8]">
            {content}
          </dd>
        )}
      </dl>
    </>
  );
}

export default ContentMessage;
