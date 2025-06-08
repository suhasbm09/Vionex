import {
  AnchorProvider,
  Program,
  Idl,
  setProvider,      // ← import setProvider
} from "@coral-xyz/anchor";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

// Load your IDL JSON using require()
const idl = require("../target/idl/vionex_impact.json");

(async () => {
  // 1) Create a Connection object pointed at Devnet
  const rpcUrl = clusterApiUrl("devnet");
  const connection = new Connection(rpcUrl, "confirmed");

  // 2) AnchorProvider needs: (connection, wallet, opts)
  //    Use the default keypair (~/.config/solana/id.json) as the signer
  const provider = new AnchorProvider(
    connection,
    AnchorProvider.local().wallet,
    {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    }
  );

  // 3) Tell Anchor’s global runtime to use this provider
  setProvider(provider);

  // 4) Build your Program object using the IDL + programId + provider
  const programId = new PublicKey("CW1KiQ7GtGfCNu4VH8rv7NKnXChUYarHoBy2sRht8NBa");
  const program = new Program(idl as Idl, provider);

  // 5) Derive the PDA for impact_counter
  const [counterPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("impact_counter")],
    program.programId
  );

  // 6) Invoke initializeCounter
  await program.methods
    .initializeCounter()
    .accounts({
      impactCounter: counterPDA,
      signer: provider.wallet.publicKey,
    })
    .rpc();

  console.log("ImpactCounter initialized:", counterPDA.toBase58());
})();
