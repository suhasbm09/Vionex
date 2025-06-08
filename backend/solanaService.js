// solanaService.js
// ----------------
// Connects to your Anchor program on Devnet and exposes `logImpact()`
// using Anchor’s Program client (no manual Borsh encoding).

const anchor = require("@coral-xyz/anchor");
const { AnchorProvider, Program, Wallet, Idl } = require("@coral-xyz/anchor");
const { Connection, PublicKey, clusterApiUrl, Keypair } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");

// ─── 1) LOAD & PATCH IDL ────────────────────────────────────────────────────────

// 1.a) Read the raw IDL JSON file
const idlPath = path.join(__dirname, "solana-idl.json");
let rawIdl;
try {
  rawIdl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
  console.log("✅ Loaded raw IDL from:", idlPath);
} catch (e) {
  console.error("❌ Failed to load/parse solana-idl.json:", e);
  process.exit(1);
}

// 1.b) Check that idl.accounts and idl.types exist
if (!Array.isArray(rawIdl.accounts) || !Array.isArray(rawIdl.types)) {
  console.error("❌ IDL must have both `accounts` and `types` arrays.");
  process.exit(1);
}

// 1.c) Inject each struct type from `idl.types` into the matching `idl.accounts` entry
const patchedAccounts = rawIdl.accounts.map((acct) => {
  const match = rawIdl.types.find((t) => t.name === acct.name);
  if (!match) {
    console.warn(`⚠️  No matching type found in idl.types for account "${acct.name}"`);
    return acct; // leave it as-is (although Program will likely fail if type is missing)
  }
  return {
    ...acct,
    type: match.type, // { kind: "struct", fields: […] }
  };
});

// 1.d) Build a new IDL object with patched accounts
const idl = {
  ...rawIdl,
  accounts: patchedAccounts,
};

// 1.e) Debug: print out patched accounts to confirm
console.log("\n>> Patched IDL.accounts entries:");
idl.accounts.forEach((a, i) => {
  console.log(`  [${i}] ${a.name} → has type?`, !!a.type);
});

// ─── 2) LOAD SOLANA KEYPAIR ────────────────────────────────────────────────────

// 2.a) Read your local keypair JSON (64‐byte secret key array)
const keypairPath = path.join(__dirname, "solana-wallet.json");
let walletKeypair;
try {
  const raw = fs.readFileSync(keypairPath, "utf8");
  const secretArr = JSON.parse(raw);
  walletKeypair = Keypair.fromSecretKey(Uint8Array.from(secretArr));
  console.log("\n✅ Loaded Solana keypair from:", keypairPath);
  console.log("   → Public Key:", walletKeypair.publicKey.toBase58());
} catch (e) {
  console.error("❌ Failed to load/parse solana-wallet.json:", e);
  process.exit(1);
}

// ─── 3) SET UP RPC CONNECTION & PROVIDER ────────────────────────────────────────
const rpcUrl = clusterApiUrl("devnet");
const connection = new Connection(rpcUrl, "confirmed");
console.log("\n🔗 Connected to Solana Devnet via:", rpcUrl);

// Wrap the keypair in Anchor’s Wallet
const wallet = new Wallet(walletKeypair);

// AnchorProvider takes (connection, wallet, opts)
const provider = new AnchorProvider(connection, wallet, {
  preflightCommitment: "confirmed",
  commitment: "confirmed",
});
anchor.setProvider(provider);
console.log("🧩 AnchorProvider initialized with wallet:", wallet.publicKey.toBase58());

// ─── 4) INSTANTIATE PROGRAM CLIENT ─────────────────────────────────────────────
const PROGRAM_ID = new PublicKey("CW1KiQ7GtGfCNu4VH8rv7NKnXChUYarHoBy2sRht8NBa");
console.log("\n📦 Attempting to create Program client with ID:", PROGRAM_ID.toBase58());

let program;
try {
  program = new Program(idl, provider);
  console.log("✅ Anchor Program client created successfully.");
} catch (e) {
  console.error("\n❌ Failed to create Anchor Program client:", e);
  process.exit(1);
}

// ─── 5) UTILITY: DERIVE PDAs ────────────────────────────────────────────────────

/**
 * Derive the ImpactCounter PDA from seed ["impact_counter"].
 */
function deriveCounterPDA() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("impact_counter")],
    PROGRAM_ID
  );
}

/**
 * Derive the Impact PDA for a given counter value.
 *
 * On‐chain, the Rust code uses seeds = [b"impact", &counter.to_le_bytes()].
 * We must replicate that exactly: an 8-byte little-endian Buffer of `counter`.
 *
 * @param {number} counterValue  – currentCount from the ImpactCounter account
 * @returns [PublicKey, number] – [impactPDA, bump]
 */
function deriveImpactPDA(counterValue) {
  // Allocate an 8-byte buffer and write the u64 as little-endian
  const countBuf = Buffer.alloc(8);
  countBuf.writeBigUInt64LE(BigInt(counterValue), 0);

  // Now seed exactly as [Buffer.from("impact"), countBuf]
  return PublicKey.findProgramAddressSync(
    [Buffer.from("impact"), countBuf],
    PROGRAM_ID
  );
}

// ─── 6) EXPORT logImpact ───────────────────────────────────────────────────────
module.exports.logImpact = async function logImpact({
  donor,
  ngo,
  medicine,
  quantity,
  timestamp,
}) {
  console.log("\n--- logImpact called with ---");
  console.log("  donor:   ", donor);
  console.log("  ngo:     ", ngo);
  console.log("  medicine:", medicine);
  console.log("  quantity:", quantity);
  console.log("  timestamp:", timestamp);

  // (a) Derive ImpactCounter PDA
  let counterPDA, counterBump;
  try {
    [counterPDA, counterBump] = deriveCounterPDA();
    console.log("🔢 ImpactCounter PDA:", counterPDA.toBase58(), "| bump:", counterBump);
  } catch (e) {
    console.error("❌ Failed to derive ImpactCounter PDA:", e);
    throw e;
  }

  // (b) Fetch the counter account to get current count
  let counterAccount;
  try {
    counterAccount = await program.account.impactCounter.fetch(counterPDA);
    console.log("📖 Fetched ImpactCounter account:", counterAccount);
  } catch (err) {
    console.error("❌ Could not fetch ImpactCounter (did you run initialize_counter?).", err);
    throw new Error("ImpactCounter PDA not found. Run initialize_counter first.");
  }
  const currentCount = counterAccount.count.toNumber();
  console.log("🔔 Current counter value:", currentCount);

  // (c) Derive the new Impact PDA using an 8-byte little-endian representation
  let impactPDA, impactBump;
  try {
    [impactPDA, impactBump] = deriveImpactPDA(currentCount);
    console.log("🌱 Derived new Impact PDA:", impactPDA.toBase58(), "| bump:", impactBump);
  } catch (e) {
    console.error("❌ Failed to derive new Impact PDA:", e);
    throw e;
  }

  // (d) Use Anchor's Program client to call logImpact(...) on‐chain
  let txSignature;
  try {
    console.log("⬆️ Sending on‐chain transaction via Anchor Program…");
    txSignature = await program.methods
      .logImpact(
        donor,
        ngo,
        medicine,
        new anchor.BN(quantity),
        new anchor.BN(timestamp)
      )
      .accounts({
        impactCounter: counterPDA,
        impact:        impactPDA,
        signer:        wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    console.log("✅ Transaction confirmed. Signature:", txSignature);
  } catch (rpcErr) {
    console.error("❌ Anchor RPC call failed:", rpcErr);
    throw rpcErr;
  }

  // (e) Return the signature and PDA addresses
  const result = {
    signature: txSignature,
    impactPDA: impactPDA.toBase58(),
    counterPDA: counterPDA.toBase58(),
  };
  console.log("→ logImpact result:", result);
  console.log("--- logImpact complete ---\n");
  return result;
};