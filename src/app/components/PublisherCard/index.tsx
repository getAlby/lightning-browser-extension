import { classNames } from "~/app/utils/index";

function generateSVGDataUrl(char: string, bgcolor: string) {
  const svg = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgcolor}" />
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="48" font-weight="900" fill="white" font-family="Open Runde, sans-serif">${char.toUpperCase()}</text>
    </svg>
  `;

  // Encode the SVG as a data URL
  const encodedSVG = encodeURIComponent(svg);
  const dataURL = `data:image/svg+xml;utf8,${encodedSVG}`;

  return dataURL;
}

export type Props = {
  title?: string;
  image?: string;
  description?: string;
  url?: string;
  isCard?: boolean;
  isSmall?: boolean;
  children?: React.ReactNode;
};

export default function PublisherCard({
  title,
  image,
  description,
  url,
  isCard = true,
  isSmall = true,
  children,
}: Props) {
  if (!title) {
    title = description;
    description = undefined;
  }
  return (
    <div
      className={classNames(
        isSmall ? "p-3" : "flex-col justify-center p-4",
        isCard && "border border-gray-200 dark:border-neutral-700 rounded-lg",
        "flex items-center bg-white dark:bg-surface-01dp"
      )}
    >
      <img
        className={`shrink-0 object-cover rounded-md ${
          isSmall ? "w-12 h-12 mr-3" : "w-20 h-20"
        }`}
        src={image || generateSVGDataUrl(title?.charAt(0) ?? "?", "#F5A241")}
        alt={`${title} logo`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = generateSVGDataUrl(title?.charAt(0) ?? "?", "#F5A241");
        }}
      />
      <div
        className={classNames(
          "flex flex-col overflow-hidden w-full",
          !isSmall && "text-center",
          isSmall && !image && "ml-1"
        )}
      >
        <h2
          title={title}
          className={
            "font-semibold dark:text-white overflow-hidden text-ellipsis whitespace-nowrap" +
            (isSmall ? "" : " mt-2 text-xl")
          }
        >
          {title}
        </h2>
        {url && (
          <a
            href={`https://${url}`}
            title={url}
            target="_blank"
            className={classNames(
              "text-gray-500 dark:text-neutral-500 overflow-hidden text-ellipsis whitespace-nowrap",
              isSmall && "text-xs"
            )}
            rel="noreferrer noopener"
          >
            {url}
          </a>
        )}
        {!url && description && (
          <p
            title={description}
            className={classNames(
              "text-gray-500 dark:text-neutral-500 overflow-hidden text-ellipsis whitespace-nowrap",
              isSmall && "text-xs"
            )}
          >
            {description}
          </p>
        )}
      </div>
      {children && <div className="mt-2 text-center">{children}</div>}
    </div>
  );
}
