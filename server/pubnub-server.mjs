import PubNub from 'pubnub';

// Defining the channels used for communication
const CHANNELS = {
  DEMO: 'DEMO',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION',
};

// Defining and exporting the PubNubServer class
export default class PubNubServer {
  // Constructor to initialize the PubNubServer with necessary dependencies and credentials
  constructor ({ blockchain, transactionPool, wallet, credentials }) {
    this.blockchain = blockchain;
    //this.transactionPool = transactionPool;
    //this.wallet = wallet;
    this.pubnub = new PubNub(credentials);

    // Subscribing to the defined channels
    this.pubnub.subscribe({ channels: Object.values(CHANNELS) });
    
    // Listener to handle incoming messages
    this.pubnub.addListener(this.listener());
  }

  // Method to broadcast the current state of the blockchain
  broadcast() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain),
    })
  }

  // Method to publish a specific transaction
  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction),
    });
  }

  // Listener method to handle incoming messages
  listener() {
    return {
      message: (msgObject) => {
        const { channel, message } = msgObject;
        const msg = JSON.parse(message);

        console.log(
          `Message received on Channel: ${channel}. Message: ${message}`
        );

        // Handle messages based on the channel they where received on
        switch (channel) {
          case CHANNELS.BLOCKCHAIN:
            this.blockchain.replaceChain(msg, true, () => {
              this.transactionPool.clearBlockTransactions({ chain: msg });
            });
            break;
          case CHANNELS.TRANSACTION:
            if (
              !this.transactionPool.transactionExist({
                address: this.wallet.publicKey,
              })
            ) {
              this.transactionPool.addTransaction(msg);
            }
            break;
          default:
            return; // Ignore messages from unknown/other channels
        }
      },
    };
  }

  // Method to publiosh messages to a specific channel
  publish({ channel, message }) {
    this.pubnub.publish({ channel, message })
  }
}