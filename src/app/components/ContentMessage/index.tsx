import { t } from "i18next";

/* eslint-disable  @typescript-eslint/no-explicit-any */
type Props = {
  heading: string;
  content:
    | {
        website: string;
        nip05: string;
        display_name: string;
        name: string;
        about: string;
        picture: string | undefined;
      }
    | string
    | any;
};
/* eslint-disable  @typescript-eslint/no-explicit-any */
function isObject(value: any) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function ContentMessage({ heading, content }: Props) {
  if (content != "+") [(content = JSON.parse(content))];
  if (isObject(content)) {
    const { website, nip05, picture, display_name, name, about } = content;
    return (
      <>
        <dl className="my-4 p-4 shadow bg-white dark:bg-surface-02dp rounded-lg overflow-hidden">
          <dt className="font-medium dark:text-white">{heading}</dt>
          <dd className="text-gray-500 dark:text-gray-400 break-all">
            Working
            {name && (
              <>
                <dt className="font-medium dark:text-white">{"Name"}</dt>
                {name}
              </>
            )}
            {display_name && (
              <>
                <dt className="font-medium dark:text-white">
                  {"Display name"}
                </dt>
                {display_name}
              </>
            )}
            {picture && (
              <>
                <dt className="font-medium dark:text-white">{"Picture"}</dt>
                <img src={picture} alt="Profile picture" />
              </>
            )}
            {about && (
              <>
                <dt className="font-medium dark:text-white">{"About"}</dt>
                {about}
              </>
            )}
            {website && (
              <>
                <dt className="font-medium dark:text-white">{"Website"}</dt>
                {website}
              </>
            )}
            {nip05 && (
              <>
                <dt className="font-medium dark:text-white">{"NIP-05"}</dt>
                {nip05}
              </>
            )}
          </dd>
        </dl>
      </>
    );
  }
  return (
    <>
      <dl className="my-4 p-4 shadow bg-white dark:bg-surface-02dp rounded-lg overflow-hidden">
        <dt className="font-medium dark:text-white">{heading}</dt>
        <dd className="text-gray-500 dark:text-gray-400 break-all">
          {content == "+" ? (
            <>
              <dt className="font-medium dark:text-white">
                {t("nostr.kinds.7")}
              </dt>
              {t("nostr.reactions.like")}
            </>
          ) : (
            content
          )}
        </dd>
      </dl>
    </>
  );
}

export default ContentMessage;
