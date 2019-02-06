const Utility = require('../Utility');
const {
   MINNING_REWARD
} = require('../config')


class Transaction {
   constructor() {
      this.id = Utility.genrateId();
      this.inputs = null;
      this.outputs = [];
   }

   static newTranscation(senderWallet, recipient, amount, data) {

      if (amount > senderWallet.balance) {
         console.log(` Amount exceeds `);
         return;
      }


      return Transaction.transactionWithOutputs(senderWallet, [{
            amount: senderWallet.balance - amount,
            address: senderWallet.publicKey,
         },
         {
            amount,
            address: recipient,
            data

         }
      ]);


   }

   static transactionWithOutputs(senderWallet, outputs) {
      const transaction = new this;
      transaction.outputs.push(...outputs);
      Transaction.signTransaction(transaction, senderWallet);

      return transaction;
   }

   static rewardTransaction(minnerWallet, blockchainWallet) {
      return Transaction.transactionWithOutputs(blockchainWallet, [{
         amount: MINNING_REWARD,
         address: minnerWallet.publicKey
      }])
   }

   update(senderWallet, recipient, amount, data) {
      const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);
      if (amount > senderOutput.amount) {
         console.log(`Amount exceeds balance`);
         return;
      }

      senderOutput.amount = senderOutput.amount - amount;
      this.outputs.push({
         amount,
         data,
         address: recipient
      });
      Transaction.signTransaction(this, senderWallet);

      return this;

   }


   static signTransaction(transaction, senderWallet) {

      transaction.inputs = {
         address: senderWallet.publicKey,
         timestamp: Date.now(),
         amount: senderWallet.balance,
         signature: senderWallet.sign(Utility.hash(transaction.outputs))
      }
   }

   static verifyTranscation(transaction) {
      return Utility.verifySignature(
         transaction.inputs.address,
         transaction.inputs.signature,
         Utility.hash(transaction.outputs)
      )
   }




}


module.exports = Transaction;