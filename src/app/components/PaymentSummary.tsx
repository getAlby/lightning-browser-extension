import Ajv from "ajv";
import { audioObjectSchema } from "~/extension/ln/webln/MetadataSchemas/audioObject";

type Props = {
  amount: string | React.ReactNode;
  amountAlt?: string;
  description?: string | React.ReactNode;
  metadata?: { [key: string]: string };
};

const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(audioObjectSchema);

function PaymentSummary({ amount, amountAlt, description, metadata }: Props) {
  if (validate(metadata)) {
    // data is MyData here
    // console.log(metadata.name)
  } else {
    //console.log(validate.errors)
  }

  const metadataElements: JSX.Element[] = [];
  if (metadata != undefined) {
    for (const key in metadata) {
      if (key[0] != "@") {
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
    }
  } else {
    metadataElements.push(<p>&quot;No Metadata Present&quot;</p>);
  }

  return (
    <dl className="mb-0">
      <dt className="font-medium dark:text-white">Amount (Satoshi)</dt>
      <dd className="text-gray-500 dark:text-neutral-400">{amount} sats</dd>
      {amountAlt && <dd className="text-gray-400">{amountAlt}</dd>}
      <dt className="mt-4 font-medium dark:text-white">Description</dt>
      <dd className="text-gray-500 dark:text-neutral-400 break-all">
        {description}
      </dd>
      <dt className="mt-4 font-medium text-gray-800 dark:text-white">
        Metadata
      </dt>
      {metadataElements.map((metadata) => (
        <>{metadata}</>
      ))}
    </dl>
  );
}

export default PaymentSummary;
