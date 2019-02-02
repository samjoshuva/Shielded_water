const {
   DIFFICULTY,
   MINE_RATE
} = require("../config");
const Utility = require('../Utility');
class Block {
   constructor(data, prev_hash, hash, timestamp, nonce, difficulty) {
      this.data = data;
      this.prev_hash = prev_hash;
      this.timestamp = timestamp;
      this.hash = hash;
      this.nonce = nonce;
      this.difficulty = difficulty || DIFFICULTY;
   }

   static mineBlock(prevBlock, data) {
      let nonce = 0;
      let timestamp, hash, difficulty;

      do {
         nonce++;
         timestamp = Date.now();
         difficulty = Block.adjustDifficulty(prevBlock, timestamp);
         hash = Block.calculateHash(data, prevBlock.prev_hash, timestamp, nonce, difficulty)

      } while (hash.substring(0, difficulty) !== "0".repeat(difficulty))

      return new Block(data, prevBlock.hash, hash, Date.now, nonce, difficulty);
   }

   static createGensisBlock() {

      return new Block([], 0, 0, "Gensis time", 0, 0)
   }

   static adjustDifficulty(prev_block, current_time) {
      let {
         difficulty
      } = prev_block;
      difficulty = prev_block.timestamp + MINE_RATE > current_time ? difficulty + 1 : difficulty - 1;
      return difficulty;

   }

   static calculateHash(data, prev_hash, timestamp) {
      return Utility.hash(data + prev_hash + timestamp).toString();
   }

   static HashBlock(block) {
      return this.calculateHash(block.data + block.prev_hash + block.timestamp).toString();

   }
}


module.exports = Block;