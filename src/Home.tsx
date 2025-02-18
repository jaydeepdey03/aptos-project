import {
  Account,
  Aptos,
  AptosConfig,
  Network,
  Ed25519PrivateKey,
} from "@aptos-labs/ts-sdk";
import {Button} from "./components/ui/button";

const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY!;
const MESSAGE = "jaydeep";

export default function Home() {
  const config = new AptosConfig({
    network: Network.DEVNET,
    fullnode: "https://aptos.testnet.porto.movementlabs.xyz/v1",
    faucet: "https://fund.testnet.porto.movementlabs.xyz/",
  });

  // Initialize the Aptos client
  const aptos = new Aptos(config);

  const privateKey = new Ed25519PrivateKey(PRIVATE_KEY);
  const account = Account.fromPrivateKey({privateKey});

  const MODULE_ADDRESS = "0x1";
  const SET_MESSAGE_FUNCTION = `${MODULE_ADDRESS}::message::set_message`;
  const GET_MESSAGE_FUNCTION = `${MODULE_ADDRESS}::message::get_message`;

  const payload = {
    function: SET_MESSAGE_FUNCTION,
    functionArguments: [MESSAGE],
    typeArguments: [],
  };

  const viewPayload = {
    function: GET_MESSAGE_FUNCTION as `${string}::${string}::${string}`,
    functionArguments: [
      "0x97ce7d1744b59a20dd1b4c800f5270c83f70a9187135c7e6086a99828c85f0f5",
    ],
  };

  async function transaction() {
    try {
      const message = await aptos.view({payload: viewPayload});
      console.log("Message:", message);

      console.log("\n=== Submitting Transaction ===\n");
      const transaction = await aptos.transaction.build.simple({
        sender:
          "0x97ce7d1744b59a20dd1b4c800f5270c83f70a9187135c7e6086a99828c85f0f5",
        data: {
          function: SET_MESSAGE_FUNCTION,
          functionArguments: [MESSAGE],
          typeArguments: [],
        },
      });

      const signature = aptos.transaction.sign({signer: account, transaction});

      // Submit the transaction to chain
      const committedTxn = await aptos.transaction.submit.simple({
        transaction,
        senderAuthenticator: signature,
      });

      console.log(`Submitted transaction: ${committedTxn.hash}`);
      const response = await aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });
      console.log({response});
      // Read the message after it has been set
      console.log("\n=== Reading Message ===\n");

      const newMessage = await aptos.view({payload: viewPayload});

      console.log("Message:", newMessage);
    } catch (error) {
      console.error("Error reading message:", error);
    }
  }
  return (
    <div>
      <Button onClick={transaction}>Submit Transaction</Button>
    </div>
  );
}
