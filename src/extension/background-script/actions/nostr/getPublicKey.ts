import { Message } from "~/types";

const getPublicKey = async (message: Message) => {
  // var privateKey = nostrTools.generatePrivateKey();
  // var publicKey = nostrTools.getPublicKey(privateKey);

  // Private key: 0a334764af75be0347e2699f4db94c2c4b557f79aa69b01ec6080224f2af100d
  // Public key: f5b795282b4ac1f11fc107485a5aa7150823024a8ae5b317d639176f881e9a74

  return {
    data: "f5b795282b4ac1f11fc107485a5aa7150823024a8ae5b317d639176f881e9a74",
  };
};

export default getPublicKey;
