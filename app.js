const express = require('express');
const BlockChain = require('./blockchain/blockchain');
const p2p = require('./p2p');
const Wallet = require('./wallet');
const TransactionPool = require('./wallet/transactionPool')
const Miner = require('./miner');

const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app = express();

app.use(express.json());

let chain = new BlockChain();
const wallet = new Wallet();
const tp = new TransactionPool();

const p2pServer = new p2p(chain, tp);

const miner = new Miner(chain, tp, wallet, p2pServer);

app.get('/blocks', (req, res) => {
  res.json(chain);
});

app.get('/transaction', (req, res) => {
  res.json(tp.transactions)
});

app.post('/transact', (req, res) => {
  const {
    recipient,
    amount,
    data
  } = req.body;
  const transaction = wallet.createTransaction(recipient, amount, data, chain, tp)
  p2pServer.broadcastTransaction(transaction)
  res.redirect('/transaction')
});

app.get('/mine-transactions', (req, res) => {
  const block = miner.mine();
  console.log(`new block added `)
  res.redirect('/blocks')
})

app.post('/mine', (req, res) => {
  chain.addBlock(req.body);
  res.send('transaction done sucessfully');

  p2pServer.syncChain();
});

app.get('/public-key', (req, res) => {
  res.json({
    publicKey: wallet.publicKey
  })
})

app.get('/balance', (req, res) => {
  res.json({
    Balance: wallet.calculateWalletBalance(chain)
  })
})

// app.use('/block', block)

app.listen(HTTP_PORT, () => {
  console.log(`listening to port http://localhost:${HTTP_PORT}`);
});

p2pServer.listen();