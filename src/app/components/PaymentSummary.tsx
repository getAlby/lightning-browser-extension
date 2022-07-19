import { Fragment } from "react";
import { MetadataValidator } from "~/schema/metadataValidator";

type Props = {
  amount: string | React.ReactNode;
  amountAlt?: string;
  description?: string | React.ReactNode;
  metadata?: { [key: string]: string };
};

function PaymentSummary({ amount, amountAlt, description, metadata }: Props) {
  const metadataElements: JSX.Element[] = [];
  if (metadata != undefined) {
    const isMetadataValid = MetadataValidator(metadata);

    if (isMetadataValid) {
      for (const key in metadata) {
        metadataElements.push(
          <>
            <dt className="mt-4 font-medium text-gray-800 dark:text-white">
              {key}
            </dt>
            <dd className="mb-0 text-gray-600 dark:text-neutral-500 break-all">
              {key == "image" ? (
                <img src={`data:image/png;base64, ${metadata[key]}`} />
              ) : (
                metadata[key]
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
      <dt className="mt-4 font-medium text-gray-800 dark:text-white">
        Metadata
      </dt>
      {metadataElements.map((metadata, key) => (
        <Fragment key={key}>{metadata}</Fragment>
      ))}
    </dl>
  );
}

export default PaymentSummary;
