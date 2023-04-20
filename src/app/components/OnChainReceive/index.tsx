import Button from "~/app/components/Button";
import Container from "~/app/components/Container";

export default function OnChainReceive() {
  return (
    <Container justifyBetween maxWidth="sm">
      <div className="text-center dark:text-neutral-200 h-full flex flex-col justify-center items-center">
        <div className="mb-8">
          <p>
            To receive Bitcoin on-chain, log-in to your{" "}
            <strong>Alby Account </strong>at getalby.com
          </p>
        </div>

        <div className="mb-8">
          <p>
            Your bitcoin on-chain address is under <strong>Receive</strong>{" "}
            page, accessible from <strong>Payments</strong>
          </p>
        </div>
      </div>
      <div className="mb-4">
        <a href="https://getalby.com/node/receive">
          <Button
            type="submit"
            label={"Go Alby Account on getalby.com ->"}
            fullWidth
            primary
          />
        </a>
      </div>
    </Container>
  );
}
