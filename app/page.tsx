"use client";

import { useEffect, useMemo, useState } from "react";
import ClientOnly from "../components/ClientOnly";
// @ts-ignore
import { CHARITIES, donateSol, getSpendableSol, type CharityId } from "dust2charity-sdk";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function Page() {
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC || "";
  const isDevnet =
    rpcUrl.includes("devnet") || rpcUrl.includes("localhost") || rpcUrl.includes("testnet");

  const FEE_BUFFER_SOL = 0.002;

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [ackMainnet, setAckMainnet] = useState(false);

  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [selectedCharityId, setSelectedCharityId] = useState<CharityId>("rfus");


  const selectedCharity = useMemo(() => {
    const found = CHARITIES.find((c: any) => c.id === selectedCharityId);
    // Fallback to first charity so TS never sees "undefined"
    return found ?? CHARITIES[0];
  }, [selectedCharityId]);
  

  const recipientName = selectedCharity.name;
  const recipientDescription = selectedCharity.description;
  const OFFICIAL_VERIFY_URL = selectedCharity.verifyUrl;

  const explorerClusterParam = isDevnet ? "devnet" : "mainnet-beta";
  const recipientAddress =
  selectedCharity.mode === "direct" ? (selectedCharity.address ?? "") : "";


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

  // Fetch balance whenever wallet or connection changes
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

  function donateMax() {
    if (selectedCharity.mode !== "direct") return;
    if (balance === null) return;

    const max = getSpendableSol(balance, FEE_BUFFER_SOL);
    setAmount(max.toFixed(6));
  }

  async function sendSol() {
    if (!publicKey) {
      setStatus("Wallet not connected");
      return;
    }

    if (!isDevnet && !ackMainnet) {
      setStatus("Please confirm the mainnet checkbox before sending real funds.");
      return;
    }

    if (selectedCharity.mode !== "direct") {
      setStatus("This charity uses Giving Block. Please use the official donation link above.");
      return;
    }

    try {
      setStatus("Preparing transaction...");

      const amt = Number(amount);
      if (!Number.isFinite(amt) || amt <= 0) {
        setStatus("Enter a valid amount greater than 0");
        return;
      }

      setStatus("Sending transaction...");

      const result = await donateSol({
        connection,
        wallet: { publicKey, sendTransaction },
        charityId: selectedCharityId,
        amountSol: amt,
        feeBufferSol: FEE_BUFFER_SOL,
        rpcUrl
      });

      setStatus(`Success! Tx: ${result.explorerUrl}`);

      const newBalance = await connection.getBalance(publicKey);
      setBalance(newBalance / LAMPORTS_PER_SOL);
    } catch (err: any) {
      console.error(err);
      setStatus(err?.message ? `Transaction failed: ${err.message}` : "Transaction failed");
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Dust2Charity {isDevnet ? "(Devnet)" : "(Mainnet)"}</h1>

      <div
        style={{
          marginTop: 12,
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8,
          background: isDevnet ? "#f5f5f5" : "#fff7e6"
        }}
      >
        {isDevnet ? <strong>Demo mode (Devnet):</strong> : <strong>⚠️ Mainnet (REAL FUNDS):</strong>}{" "}
        {isDevnet
          ? "Transactions use Devnet SOL and have no real-world financial impact."
          : "Transactions send real SOL and are irreversible. Verify the recipient before sending."}
      </div>

      <ClientOnly>
        <WalletMultiButton />
      </ClientOnly>

      {/* Charity selector */}
      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {CHARITIES.map((c: any) => (
          <label
            key={c.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              cursor: "pointer",
              background: selectedCharityId === c.id ? "#f5f5f5" : "white"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <input
                type="radio"
                name="charity"
                checked={selectedCharityId === c.id}
                onChange={() => setSelectedCharityId(c.id)}
                style={{ marginTop: 4 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <strong>{c.name}</strong>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 12,
                      border: "1px solid #ddd"
                    }}
                  >
                    {c.mode === "direct" ? "Direct SOL transfer" : "Donate via Giving Block"}
                  </span>
                </div>
                <p style={{ margin: "6px 0 0", fontSize: 13, opacity: 0.9 }}>{c.description}</p>
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Balance display */}
      {publicKey && balance !== null && (
        <p style={{ marginTop: 12 }}>
          <strong>Balance:</strong> {balance.toFixed(4)} SOL
        </p>
      )}

      {/* Recipient box */}
      <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Recipient</h3>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 999,
              fontSize: 12,
              border: "1px solid #ddd",
              background: "#eaffea"
            }}
          >
            ✅ Verified source link
          </span>
        </div>

        <p style={{ margin: "8px 0" }}>
          <strong>{recipientName}</strong>
        </p>

        <p style={{ margin: "6px 0", fontSize: 13, opacity: 0.9 }}>{recipientDescription}</p>

        {selectedCharity.mode === "direct" ? (
          <div style={{ margin: "10px 0" }}>
            <strong>Address:</strong> <code>{shortAddr(recipientAddress)}</code>
            {recipientAddress && (
              <>
                <button
                  onClick={() => copyToClipboard(recipientAddress)}
                  style={{ marginLeft: 8, padding: "4px 8px" }}
                >
                  Copy
                </button>
                <a
                  href={`https://explorer.solana.com/address/${recipientAddress}?cluster=${explorerClusterParam}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginLeft: 8 }}
                >
                  View on Solana Explorer
                </a>
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                  “Official source page” is the charity website. “Solana Explorer” shows the address on the blockchain.
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ marginTop: 10 }}>
            <p style={{ margin: "8px 0", fontSize: 13 }}>
              This charity uses The Giving Block donation flow. For safety and proper attribution, donate on the
              official page:
            </p>
            {"donationUrl" in selectedCharity && selectedCharity.donationUrl && (
              <a
                href={selectedCharity.donationUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  textDecoration: "none"
                }}
              >
                Open official donation page
              </a>
            )}
          </div>
        )}

        <p style={{ margin: "10px 0 0", fontSize: 13, opacity: 0.9 }}>
          Verify recipient yourself:{" "}
          <a href={OFFICIAL_VERIFY_URL} target="_blank" rel="noreferrer">
            official source page
          </a>
        </p>

        {/* ✅ SINGLE source/verified block (duplicate removed) */}
        <p style={{ margin: "8px 0", fontSize: 12, opacity: 0.8 }}>
          Source: {selectedCharity.sourceLabel} · Verified: {selectedCharity.verifiedAt}
        </p>
        {selectedCharity.notes && (
          <p style={{ margin: "6px 0", fontSize: 12, opacity: 0.8 }}>
            Note: {selectedCharity.notes}
          </p>
        )}

        <p style={{ margin: "10px 0 0", fontSize: 13, opacity: 0.85 }}>
          <strong>Safety:</strong> This site never asks for private keys. You approve the donation inside your wallet.
        </p>
      </div>

      {!isDevnet && (
        <label style={{ display: "block", marginTop: 16 }}>
          <input
            type="checkbox"
            checked={ackMainnet}
            onChange={(e) => setAckMainnet(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          I understand this sends real funds on Solana mainnet and is irreversible.
        </label>
      )}

      {/* Donate UI */}
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
          disabled={selectedCharity.mode !== "direct" || (!isDevnet && !ackMainnet)}
          style={{
            padding: 8,
            marginRight: 8,
            opacity: selectedCharity.mode !== "direct" ? 0.5 : 1,
            cursor: selectedCharity.mode !== "direct" ? "not-allowed" : "pointer"
          }}
        >
          Donate Max
        </button>

        <button
          onClick={sendSol}
          disabled={selectedCharity.mode !== "direct" || (!isDevnet && !ackMainnet)}
          style={{
            padding: 8,
            opacity: selectedCharity.mode !== "direct" ? 0.5 : 1,
            cursor: selectedCharity.mode !== "direct" ? "not-allowed" : "pointer"
          }}
        >
          Send SOL
        </button>
      </div>

      {selectedCharity.mode === "direct" && (
        <p style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
          Max uses a buffer of {FEE_BUFFER_SOL} SOL to avoid failed transactions.
        </p>
      )}

      {status && <p style={{ marginTop: 16 }}>{status}</p>}
    </main>
  );
}
