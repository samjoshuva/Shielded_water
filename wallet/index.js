const { INITIAL_BALANCE } = require('../config');

const Utility = require('../Utility');
const Transaction = require('./transactions');

class Wallet {
  constructor() {
    this.balance = INITIAL_BALANCE;
    this.keyPair = Utility.genrateKeyPair();
    this.publicKey = this.keyPair.getPublic().encode('hex');
  }

  toString() {
    return `Wallet =
      publicKey: ${this.publicKey}
      Balance : ${this.balance}`;
  }

  sign(dataHash) {
    return this.keyPair.sign(dataHash);
  }

  createTransaction(recipient, amount, data, blockchain, transactionPool) {
    this.balance = this.calculateWalletBalance(blockchain);
    // console.log(`createTransaction: ${this.balance}`);

    if (amount > this.balance) {
      console.log('Amount exceeds');
      return;
    }

    let transaction = transactionPool.existingTransaction(this.publicKey);
    if (transaction) {
      transaction.update(this, recipient, amount, data);
    } else {
      transaction = Transaction.newTranscation(this, recipient, amount, data);
      transactionPool.updateOrAddTransaction(transaction);
    }

    return transaction;
  }

  calculateWalletBalance(blockchain) {
    let balance = this.balance;
    let transactions = [];
    blockchain.chain.forEach(block =>
      block.data.forEach(transaction => {
        transactions.push(transaction);
      })
    );

    const walletInputTs = transactions.filter(
      transaction => transaction.inputs.address === this.publicKey
    );
    let startTime = 0;

    if (walletInputTs.length > 0) {
      const recentInputT = walletInputTs.reduce((prev, cur) =>
        prev.inputs.timestamp > cur.inputs.timestamp ? prev : cur
      );

      balance = recentInputT.outputs.find(
        output => output.address === this.publicKey
      ).amount;

      startTime = recentInputT.inputs.timestamp;
    }

    transactions.forEach(transaction => {
      if (transaction.inputs.timestamp > startTime) {
        transaction.outputs.find(output => {
          if (output.address === this.publicKey) {
            balance += output.amount;
            console.log(`Balance : ${balance}`);
          }
        });
      }
    });

    return balance;
  }

  static blockchainWallet() {
    const blockchainWallet = new this();
    blockchainWallet.address = 'blockchain-wallet';
    return blockchainWallet;
  }
}

module.exports = Wallet;
