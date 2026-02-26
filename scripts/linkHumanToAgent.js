const { auth } = require("@iden3/js-iden3-auth");
const { CircuitId } = require("@0xpolygonid/js-sdk");
const {
  buildEthereumAddressFromDid,
  parseArgs,
  sendDirectMessage,
  urlFormating,
  outputSuccess,
  formatError,
} = require("./shared/utils");
const { computeAttestationHash } = require("./shared/attestation");
const { getInitializedRuntime } = require("./shared/bootstrap");
const { signChallenge } = require("./signChallenge");

const transactionSender = "0x270D01a51ec474Fa7a534eAD9F519983541E5acD"; // relay sender address
const verifierDid =
  "did:iden3:billions:main:2VmAkXrihYaLJSNZms19Ytg28xBFeGjpNafR1ciPZS"; // should be the same as dashboard DID
const callbackBase =
  "https://attestation-relay.polygonid.me/api/claim?attestation=";
const walletAddress = "https://billions-wallet-dev.internal-iden3-dev.com";
const verificationMessage =
  "Complete the verification to link your identity to the agent";

function createPOUScope(transactionSender) {
  return {
    id: 1,
    circuitId: CircuitId.AtomicQueryV3OnChainStable,
    params: {
      sender: transactionSender,
    },
    query: {
      allowedIssuers: [
        "did:iden3:billions:main:2VvVPv3MGEjrcqnCcWxgrY5kWrQ8VbLjiDNUGqD3hw",
      ],
      type: "UniquenessCredential",
      context: "ipfs://QmcUEDa42Er4nfNFmGQVjiNYFaik6kvNQjfTeBrdSx83At",
    },
  };
}

function createAuthScope(recipientDid) {
  return {
    id: 2,
    circuitId: CircuitId.AuthV3_8_32,
    params: {
      challenge: computeAttestationHash({
        recipientDid: recipientDid,
        recipientEthAddress: buildEthereumAddressFromDid(recipientDid),
      }),
    },
  };
}

function createAuthRequestMessage(jws, recipientDid) {
  const callback = callbackBase + jws;
  const scope = [
    createPOUScope(transactionSender),
    createAuthScope(recipientDid),
  ];

  const message = auth.createAuthorizationRequestWithMessage(
    "Link Human to Agent",
    "Complete the verification to link your identity to the agent",
    verifierDid,
    encodeURI(callback),
    {
      scope,
    },
  );

  const encodedMessage = encodeURI(
    Buffer.from(JSON.stringify(message)).toString("base64"),
  );

  return `${walletAddress}#i_m=${encodedMessage}`;
}

/**
 * Creates a pairing URL for linking a human identity to the agent.
 * @param {object} challenge - Challenge object with name and description fields.
 * @param {string} [didOverride] - Optional DID to use instead of the default.
 * @returns {Promise<string>} The wallet URL the human must open to complete verification.
 */
async function createPairing(challenge, didOverride) {
  const { kms, didsStorage } = await getInitializedRuntime();

  const entry = didOverride
    ? await didsStorage.find(didOverride)
    : await didsStorage.getDefault();

  if (!entry) {
    const errorMsg = didOverride
      ? `No DID ${didOverride} found`
      : "No default DID found";
    throw new Error(errorMsg);
  }

  const recipientDid = entry.did;
  const signedChallenge = await signChallenge(challenge, entry, kms);

  return createAuthRequestMessage(signedChallenge, recipientDid);
}

async function main() {
  try {
    const args = parseArgs();

    if (!args.challenge || !args.to) {
      console.error(
        JSON.stringify({
          success: false,
          error:
            "Invalid arguments. Usage: node linkHumanToAgent.js --to <sender> --challenge <json> [--did <did>]",
        }),
      );
      process.exit(1);
    }

    const challenge = JSON.parse(args.challenge);
    const url = await createPairing(challenge, args.did);

    sendDirectMessage(args.to, urlFormating(verificationMessage, url));

    outputSuccess({ success: true });
  } catch (error) {
    console.error(formatError(error));
    process.exit(1);
  }
}

module.exports = { createPairing };

if (require.main === module) {
  main();
}
