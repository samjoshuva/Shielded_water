const Transaction = require('./transactions')
class TransactionPool {
   constructor() {
      this.transactions = [];
   }

   updateOrAddTransaction(transaction) {

      let transactionWithId = this.transactions.find(t => t.id === transaction.id);
      if (transactionWithId) {
         this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;

      } else {
         this.transactions.push(transaction);
      }
   }

   existingTransaction(address) {

      return this.transactions.find(t => t.inputs.address === address)
   }

   validTransactions() {
      return this.transactions.filter(t => {
         const outputTotal = t.outputs.reduce((total, output) => {
            return total + output.amount;
         }, 0)

         if (t.inputs.amount !== outputTotal) {
            console.log(`Invalid transaction from ${t.inputs.address}`);
            return;
         }


         if (!Transaction.verifyTranscation(t)) {
            console.log(`Invalid signature from ${t.inputs.address}`);
            return;
         }

         return t;
      });
   }
   clear() {
      this.transactions = [];
   }



}


module.exports = TransactionPool;