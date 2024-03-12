import Container from "@components/Container";
import { PopiconsDownloadLine } from "@popicons/react";
import { FunctionComponent, SVGProps, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import CardButton from "~/app/components/CardButton";
import CardButtonGroup from "~/app/components/CardButton/Group";
import { ContentBox } from "~/app/components/ContentBox";
import Hyperlink from "~/app/components/Hyperlink";
import toast from "~/app/components/Toast";
import api from "~/common/lib/api";

function NostrSetup() {
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.nostr.setup",
  });
  const navigate = useNavigate();
  const [step, setStep] = useState<"start" | "import">("start");
  const { id } = useParams() as { id: string };

  useEffect(() => {
    (async () => {
      try {
        const account = await api.getAccount(id);
        if (account.nostrEnabled) {
          // do not allow user to setup nostr if they already have a key
          navigate(`/accounts/${id}`);
        }
      } catch (e) {
        console.error(e);
        if (e instanceof Error) toast.error(`Error: ${e.message}`);
      }
    })();
  }, [id, navigate]);

  return (
    <div>
      <Container maxWidth="md">
        <ContentBox>
          {step === "start" && (
            <>
              <h1 className="font-bold text-2xl dark:text-white">
                {t("title")}
              </h1>
              <p className="text-gray-500 dark:text-neutral-500">
                {t("description")}
              </p>
              <p className="text-gray-500 dark:text-neutral-500">
                <Trans
                  i18nKey={"description2"}
                  t={t}
                  components={[
                    // eslint-disable-next-line react/jsx-key
                    <span className="font-bold"></span>,
                  ]}
                />
              </p>

              <CardButtonGroup>
                <CardButton
                  title={t("new.label")}
                  description={t("new.description")}
                  icon={TwoKeysIcon}
                  onClick={() => navigate("../secret-key/new")}
                />
                <CardButton
                  title={t("import.label")}
                  description={t("import.description")}
                  icon={PopiconsDownloadLine}
                  onClick={() => setStep("import")}
                />
              </CardButtonGroup>
            </>
          )}
          {step === "import" && (
            <>
              <h1 className="font-bold text-2xl dark:text-white">
                {t("import.title")}
              </h1>

              <CardButtonGroup>
                <CardButton
                  title={t("import.private_key.label")}
                  description={t("import.private_key.description")}
                  icon={KeyIcon}
                  onClick={() => navigate("../nostr/settings")}
                />
                <CardButton
                  title={t("import.recovery_phrase.label")}
                  description={t("import.recovery_phrase.description")}
                  icon={MnemonicIcon}
                  onClick={() => navigate("../secret-key/import")}
                />
              </CardButtonGroup>
            </>
          )}
          <div className="text-center text-gray-500 dark:text-neutral-500">
            <Trans
              i18nKey={"new_to_nostr"}
              t={t}
              components={[
                // eslint-disable-next-line react/jsx-key
                <Hyperlink
                  href="https://www.nostr.how/"
                  target="_blank"
                  rel="noreferer noopener"
                ></Hyperlink>,
              ]}
            />
          </div>
        </ContentBox>
      </Container>
    </div>
  );
}

export default NostrSetup;

const MnemonicIcon: FunctionComponent<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <rect width="13" height="13" x="5.5" y="5.5" rx="1"></rect>
    <path
      strokeLinecap="round"
      d="M15 16h1.5M11.5 16H13M8 16h1.5M15 13.333h1.5M11.5 13.333H13M8 13.333h1.5M15 10.667h1.5M11.5 10.667H13M8 10.667h1.5M15 8h1.5M11.5 8H13M8 8h1.5"
    ></path>
  </svg>
);

const TwoKeysIcon: FunctionComponent<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <g clipPath="url(#clip0)">
      <path
        strokeLinecap="round"
        d="M14.257 5.976c-.85-1.7-2.832-2.638-4.802-2.147-2.27.566-3.663 2.815-3.112 5.023.157.633.458 1.194.86 1.659l-2.709 4.37a1.5 1.5 0 00-.18 1.153l.36 1.44a.25.25 0 00.302.183l1.528-.381a1.5 1.5 0 00.912-.666l2.884-4.655"
      ></path>
      <ellipse
        cx="10.82"
        cy="7.266"
        rx="1.059"
        ry="1.03"
        transform="rotate(-14 10.82 7.266)"
      ></ellipse>
      <path d="M17.81 15.61c2.27-.566 3.664-2.815 3.113-5.023-.55-2.209-2.837-3.54-5.106-2.974-2.27.566-3.663 2.815-3.113 5.023.158.633.458 1.194.86 1.659l-2.708 4.37a1.5 1.5 0 00-.18 1.153l.359 1.44a.25.25 0 00.303.183l1.527-.381a1.5 1.5 0 00.912-.666l2.885-4.655c.378.008.763-.033 1.149-.129z"></path>
      <ellipse
        cx="17.203"
        cy="10.984"
        rx="1.059"
        ry="1.03"
        transform="rotate(-14 17.203 10.984)"
      ></ellipse>
    </g>
    <defs>
      <clipPath id="clip0">
        <path fill="#fff" d="M0 0h24v24H0z"></path>
      </clipPath>
    </defs>
  </svg>
);

const KeyIcon: FunctionComponent<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      d="M18.865 7.374c.74 2.968-1.163 5.998-4.25 6.767a6.01 6.01 0 01-1.155.172l-3.435 5.471a2 2 0 01-1.21.877l-1.974.492a1 1 0 01-1.212-.728l-.445-1.786a2 2 0 01.246-1.547l3.157-5.028a5.338 5.338 0 01-.9-1.903c-.74-2.968 1.162-5.998 4.249-6.768 3.087-.77 6.189 1.013 6.929 3.98zm-5.157 2.991a2 2 0 10-.967-3.881 2 2 0 00.967 3.881z"
      clipRule="evenodd"
    ></path>
  </svg>
);
