"use client";

import ClientOnly from "components/ClientOnly";
import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction
} from "@solana/web3.js";

export default function Page() {
  const FEE_BUFFER_SOL = 0.001; // safe buffer on devnet/mainnet; you can lower later
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const recipientName = "Save the Children";

  // Put the official verification link here (we’ll fill this in once you confirm the exact URL you used)
  const OFFICIAL_VERIFY_URL = "PASTE_OFFICIAL_SAVE_THE_CHILDREN_CRYPTO_DONATION_URL_HERE";
  
  // A simple manual “verified” flag for MVP. We’ll set this to true once you confirm the address you’re using.
  const RECIPIENT_VERIFIED = false;
  
 
  // 🔹 Fetch balance whenever wallet or connection changes
  useEffect(() => {
    async function fetchBalance() {
      if (!publicKey) {
        setBalance(null);
        return;
      }
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / LAMPORTS_PER_SOL);
    }

    fetchBalance();
  }, [publicKey, connection]);

  async function sendSol() {
    if (!publicKey) {
      setStatus("Wallet not connected");
      return;
    }

    try {
      setStatus("Creating transaction...");

      if (!recipientAddress) {
        setStatus("Recipient address is not configured.");
        return;
      }
      const recipient = new PublicKey(recipientAddress);
      

      const lamports = Math.floor(
        Number(amount) * LAMPORTS_PER_SOL
      );

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipient,
          lamports
        })
      );

      setStatus("Sending transaction...");
      const signature = await sendTransaction(transaction, connection);

      await connection.confirmTransaction(signature, "confirmed");

      setStatus(`Success! Tx: ${signature}`);

      // 🔹 Refresh balance after successful tx
      const newBalance = await connection.getBalance(publicKey);
      setBalance(newBalance / LAMPORTS_PER_SOL);

    } catch (err) {
      console.error(err);
      setStatus("Transaction failed");
    }
  }
  function donateMax() {
    if (balance === null) return;
    const max = Math.max(0, balance - FEE_BUFFER_SOL);
    setAmount(max.toFixed(6));
  }
  const recipientAddress = process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS || "";

function shortAddr(addr: string) {
  if (!addr) return "";
  return addr.length > 8 ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : addr;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    setStatus("Recipient address copied.");
    setTimeout(() => setStatus(""), 1500);
  } catch {
    setStatus("Copy failed. Please copy manually.");
  }
}

  return (
    <main style={{ padding: 24 }}>
      <h1>Dust2Charity (Devnet)</h1>

      <ClientOnly>
  <WalletMultiButton />
</ClientOnly>


      {/* Balance display */}
      {publicKey && balance !== null && (
        <p style={{ marginTop: 12 }}>
          <strong>Balance:</strong> {balance.toFixed(4)} SOL
        </p>
      )}
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
  <h3 style={{ margin: 0 }}>Recipient</h3>

  <span
    style={{
      padding: "2px 8px",
      borderRadius: 999,
      fontSize: 12,
      border: "1px solid #ddd",
      background: RECIPIENT_VERIFIED ? "#eaffea" : "#fff7e6"
    }}
  >
    {RECIPIENT_VERIFIED ? "✅ Verified" : "⚠️ Not verified yet"}
  </span>
</div>

  <p style={{ margin: "8px 0" }}>
    <strong>{recipientName}</strong>
  </p>

  <p style={{ margin: "8px 0" }}>
    <strong>Address:</strong>{" "}
    <code>{shortAddr(recipientAddress)}</code>{" "}
    {recipientAddress && (
      <>
        <button
          onClick={() => copyToClipboard(recipientAddress)}
          style={{ marginLeft: 8, padding: "4px 8px" }}
        >
          Copy
        </button>{" "}
        <a
          href={`https://explorer.solana.com/address/${recipientAddress}?cluster=devnet`}
          target="_blank"
          rel="noreferrer"
          style={{ marginLeft: 8 }}
        >
          View on Explorer
        </a>
      </>
    )}
  </p>

  <p style={{ margin: "8px 0", fontSize: 13, opacity: 0.85 }}>
    <strong>Safety:</strong> This site never asks for private keys. You approve the donation inside your wallet.
    Always verify the recipient address before sending.
  </p>

<div style={{ marginTop: 20 }}>
  <input
    type="number"
    placeholder="Amount in SOL"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
    style={{ padding: 8, marginRight: 8 }}
  />

  <button
    onClick={donateMax}
    style={{ padding: 8, marginRight: 8 }}
  >
    Donate Max
  </button>

  <button onClick={sendSol} style={{ padding: 8 }}>
    Send SOL
  </button>
</div>

<p style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
  Max uses a buffer of {FEE_BUFFER_SOL} SOL to avoid failed transactions.
</p>


      {status && <p style={{ marginTop: 16 }}>{status}</p>}
    </main>
  );
}
