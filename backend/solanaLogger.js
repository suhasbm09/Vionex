// backend/solanaLogger.js
const fs   = require('fs');
const path = require('path');
const {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction
} = require('@solana/web3.js');
const borsh = require('borsh');

// 1) Your deployed Anchor program ID
const PROGRAM_ID = new PublicKey('9dkwNagtgEGXme8zZfSvwtTwoTvG6thwhWmyohkrooGY');

// 2) Solana Devnet RPC connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// 3) Load the backend’s keypair (payer) from file
const KEYPAIR_PATH = path.join(__dirname, 'vionex-keypair.json');
if (!fs.existsSync(KEYPAIR_PATH)) {
  throw new Error(`Missing Solana keypair at ${KEYPAIR_PATH}`);
}
const secret = JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf8'));
const payer  = Keypair.fromSecretKey(Uint8Array.from(secret));

// 4) Anchor‐style 8‐byte discriminator for log_confirmation
const DISCRIM = Buffer.from([29, 101, 147, 18, 102, 231, 78, 49]);

// 5) Args class matching your on‐chain struct
class LogArgs {
  constructor({ donationId, verificationCode, timestamp }) {
    this.discriminator    = DISCRIM;                      // [u8;8]
    this.donationId       = donationId;                   // string
    this.donor            = payer.publicKey.toBuffer();   // [u8;32]
    this.ngo              = payer.publicKey.toBuffer();   // [u8;32]
    this.timestamp        = timestamp;                    // u64
    this.verificationCode = verificationCode;             // string
  }
}

// 6) Borsh schema: use ['u8', length] for byte arrays
const schema = new Map([
  [LogArgs, {
    kind: 'struct',
    fields: [
      ['discriminator',    ['u8', 8]],
      ['donationId',       'string'],
      ['donor',            ['u8', 32]],
      ['ngo',              ['u8', 32]],
      ['timestamp',        'u64'],
      ['verificationCode', 'string']
    ]
  }]
]);

/**
 * Logs a confirmation record on Solana Devnet.
 * Uses the backend keypair as both donor & NGO identities.
 *
 * @param {{ donationId: string, verificationCode: string }} params
 * @returns {Promise<string>} the transaction signature
 */
async function logConfirmationOnChain({ donationId, verificationCode }) {
  // a) Derive the PDA for the record account
  const [recordPda] = await PublicKey.findProgramAddress(
    [Buffer.from('record'), Buffer.from(donationId)],
    PROGRAM_ID
  );

  // b) Build and serialize instruction data
  const timestamp = BigInt(Math.floor(Date.now() / 1000));
  const args      = new LogArgs({ donationId, verificationCode, timestamp });
  const data      = borsh.serialize(schema, args);

  // c) Create the instruction
  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: recordPda,             isSigner: false, isWritable: true  },
      { pubkey: payer.publicKey,       isSigner: true,  isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ],
    data
  });

  // d) Send the transaction
  const tx  = new Transaction().add(ix);
  const sig = await sendAndConfirmTransaction(connection, tx, [payer]);
  console.log('✅ Solana Devnet tx:', sig);
  return sig;
}

module.exports = { logConfirmationOnChain };
