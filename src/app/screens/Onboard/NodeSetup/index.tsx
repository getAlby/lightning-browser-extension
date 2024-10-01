import { useTranslation } from "react-i18next";
import Button from "~/app/components/Button";
import utils from "~/common/lib/utils";

export default function NodeSetup() {
  const { t: tCommon } = useTranslation("common");
  return (
    <div className="flex flex-col items-center mx-auto mt-14 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-4">Meet Alby Account</h1>
      <p className="text-gray-600 text-center">
        Your Alby Account{" "}
        <span className="font-semibold">connects to your own wallet</span> and
        gives your wallet super powers like a unique lightning address and the
        ability to connect to various bitcoin apps.
      </p>
      <img
        className="object-cover w-full h-full"
        src="/assets/images/wallet.png"
      />
      <div className="flex mt-6">
        <Button
          label={tCommon("actions.continue")}
          primary
          flex
          onClick={() =>
            utils.openUrl("https://getalby.com/onboarding/node/new")
          }
        />
      </div>
    </div>
  );
}
