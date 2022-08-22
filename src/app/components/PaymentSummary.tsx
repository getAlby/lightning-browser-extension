import { MetadataRenderer } from "~/schema/MetadataRenderer";
import { MetadataValidator } from "~/schema/metadataValidator";

type Props = {
  amount: string | React.ReactNode;
  amountAlt?: string;
  description?: string | React.ReactNode;
  metadata?: string;
};

function PaymentSummary({ amount, amountAlt, description, metadata }: Props) {
  const metadataElements: JSX.Element[] = [];
  if (metadata != undefined) {
    const metadataObject: object = JSON.parse(metadata);
    const isMetadataValid: boolean = MetadataValidator(metadataObject);

    if (isMetadataValid) {
      for (const [key, value] of Object.entries(metadataObject)) {
        metadataElements.push(
          <>
            <dt className="mt-4 font-medium text-gray-800 dark:text-white">
              {key}
            </dt>
            <dd className="mb-0 text-gray-600 dark:text-neutral-500 break-all">
              {key == "image" ? (
                <img src={`data:image/png;base64, ${value}`} />
              ) : (
                value
              )}
            </dd>
          </>
        );
      }
    } else {
      metadataElements.push(<p>&quot;No valid Metadata Provided&quot;</p>);
    }
  } else {
    metadataElements.push(<p>&quot;No Metadata Present&quot;</p>);
  }

  return (
    <dl className="mb-0">
      <dt className="font-medium text-gray-800 dark:text-white">Amount</dt>
      <dd className="mb-0 text-gray-600 dark:text-neutral-500">
        {amount} sats
      </dd>
      {amountAlt && <dd className="text-gray-500">{amountAlt}</dd>}
      <dt className="mt-4 font-medium text-gray-800 dark:text-white">
        Description
      </dt>
      <dd className="mb-0 text-gray-600 dark:text-neutral-500 break-all">
        {description}
      </dd>
      <div>
        <p className="mt-4 font-medium text-gray-800 dark:text-white">
          Metadata
        </p>
        {MetadataRenderer(metadata)}
      </div>
    </dl>
  );
}

export default PaymentSummary;
