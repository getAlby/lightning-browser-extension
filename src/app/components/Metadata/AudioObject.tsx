import Button from "../Button";
import "./metadata.css";

type Props = {
  type?: string;
  contentUrl?: string;
  url?: string;
  embedUrl?: string;
  thumbnail?: string;
  name?: string;
  creator?: string;
  image?: string;
  width?: string;
  height?: string;
};
export default function AudioObject({
  type,
  name,
  contentUrl,
  url,
  embedUrl,
  thumbnail,
  creator,
  image,
  width,
  height,
}: Props) {
  return (
    <dl>
      <dt className="mt-4 font-medium text-gray-800 dark:text-white">Type</dt>
      <dd className="mb-0 text-gray-600 dark:text-neutral-500 break-all">
        {type}
      </dd>
      {thumbnail ? (
        <>
          <dt className="mt-4 font-medium text-gray-800 dark:text-white">
            thumbnail
          </dt>
          <dd className="details-img">
            <img
              src={`data:image/png;base64, ${thumbnail}`}
              width={width}
              height={height}
            />
          </dd>
        </>
      ) : (
        <></>
      )}
      {image ? (
        <>
          <dt className="mt-4 font-medium text-gray-800 dark:text-white">
            image
          </dt>
          <dd>
            <Button
              label="Open Image"
              onClick={() => {
                const newTab = window.open();
                newTab?.document.write(
                  `<img src="data:image/png;base64, ${image}"/>`
                );
              }}
            ></Button>
          </dd>
        </>
      ) : (
        <></>
      )}
      {name ? (
        <>
          <dt className="mt-4 font-medium text-gray-800 dark:text-white">
            Name
          </dt>
          <dd className="mb-0 text-gray-600 dark:text-neutral-500 break-all">
            {name}
          </dd>
        </>
      ) : (
        <></>
      )}
      {creator ? (
        <>
          <dt className="mt-4 font-medium text-gray-800 dark:text-white">
            creator
          </dt>
          <dd className="mb-0 text-gray-600 dark:text-neutral-500 break-all">
            {creator}
          </dd>
        </>
      ) : (
        <></>
      )}
      {url ? (
        <>
          <dt className="mt-4 font-medium text-gray-800 dark:text-white">
            url
          </dt>
          <dd className="mb-0 text-gray-600 dark:text-neutral-500 break-all">
            <a
              className="block px-1 font-semibold transition-colors duration-200 text-orange-bitcoin hover:text-orange-bitcoin dark:text-orange-bitcoin"
              target="_blank"
              href={url}
              rel="noreferrer"
            >
              Additional Information
            </a>
          </dd>
        </>
      ) : (
        <></>
      )}
      {embedUrl ? (
        <>
          <dt className="mt-4 font-medium text-gray-800 dark:text-white">
            embedUrl
          </dt>
          <dd>
            <audio controls>
              <source src={embedUrl} />
            </audio>
          </dd>
        </>
      ) : (
        <></>
      )}
    </dl>
  );
}
