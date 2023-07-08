import {
  BIP371SigningData,
  Pset,
  Signer,
  TapScriptSig,
  Transaction,
  bip341,
  networks,
} from "liquidjs-lib";
import * as secp256k1 from "~/extension/background-script/liquid/secp256k1";
import state from "~/extension/background-script/state";
import { MessageSignPset } from "~/types";

const serializeSchnnorrSig = (sig: Buffer, hashtype: number) =>
  Buffer.concat([
    sig,
    hashtype !== 0x00 ? Buffer.of(hashtype) : Buffer.alloc(0),
  ]);

const signPset = async (message: MessageSignPset) => {
  try {
    const psetBase64 = message.args.pset;
    if (!psetBase64 || typeof psetBase64 !== "string") {
      throw new Error("PSET missing");
    }

    const network = networks[message.args.network];
    if (!network) {
      throw new Error(`Invalid network: "${message.args.network}"`);
    }

    const pset = Pset.fromBase64(psetBase64);

    const password = await state.getState().password();
    if (!password) {
      throw new Error("No password set");
    }

    const liquid = await state.getState().getLiquid();
    const liquidPublicKey = Buffer.from(
      Buffer.from(liquid.getPublicKey(), "hex")
    ).subarray(1); // remove prefix  to get 32 bytes public key

    const signer = new Signer(pset);

    for (const [inIndex, input] of pset.inputs.entries()) {
      // sign key-path taproot input using liquidPublicKey
      if (
        input.tapInternalKey &&
        input.tapInternalKey.equals(liquidPublicKey)
      ) {
        const sighashType = input.sighashType || Transaction.SIGHASH_DEFAULT;
        const sighash = pset.getInputPreimage(
          inIndex,
          sighashType,
          network.genesisBlockHash
        );

        const signature = liquid.signSchnorr(
          Buffer.from(sighash).toString("hex"),
          true
        );

        const partialSig: BIP371SigningData = {
          tapKeySig: serializeSchnnorrSig(
            Buffer.from(signature, "hex"),
            sighashType
          ),
          genesisBlockHash: network.genesisBlockHash,
        };

        signer.addSignature(
          inIndex,
          partialSig,
          Pset.SchnorrSigValidator(secp256k1)
        );

        continue;
      }

      // sign key-path tapscript leaves using liquidPublicKey
      if (input.tapLeafScript && input.tapLeafScript.length > 0) {
        for (const leaf of input.tapLeafScript) {
          const script = leaf.script.toString("hex");
          if (!script.includes(liquidPublicKey.subarray(1).toString("hex"))) {
            continue;
          }

          const leafHash = bip341.tapLeafHash({
            scriptHex: script,
            version: leaf.leafVersion,
          });

          const sighashType = input.sighashType || Transaction.SIGHASH_DEFAULT;
          const sighash = pset.getInputPreimage(
            inIndex,
            sighashType,
            network.genesisBlockHash,
            leafHash
          );

          const signature = liquid.signSchnorr(sighash.toString("hex"));
          const tapScriptSigs: TapScriptSig[] = [
            {
              leafHash,
              pubkey: liquidPublicKey,
              signature: serializeSchnnorrSig(
                Buffer.from(signature, "hex"),
                sighashType
              ),
            },
          ];

          const partialSig: BIP371SigningData = {
            tapScriptSigs,
            genesisBlockHash: network.genesisBlockHash,
          };

          signer.addSignature(
            inIndex,
            partialSig,
            Pset.SchnorrSigValidator(secp256k1)
          );
        }
      }
    }

    return {
      data: {
        signed: signer.pset.toBase64(),
      },
    };
  } catch (e) {
    return {
      error: "signPset failed: " + e,
    };
  }
};

export default signPset;
