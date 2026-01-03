"use client";

import { useMemo, useState } from "react";
import { donateSol, donateUsdc, CHARITIES, type CharityId } from "dust2charity-sdk";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

export default function DonateWidget() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [charityId, setCharityId] = useState<CharityId>("rfus");
  const [asset, setAsset] = useState<"SOL" | "USDC">("SOL");
  const [amount, setAmount] = useState("0.01");
  const [status, setStatus] = useState("");

  const charity = useMemo(() => CHARITIES.find((c) => c.id === charityId)!, [charityId]);

  async function onDonate() {
    try {
      setStatus("Preparing...");
      if (!publicKey) throw new Error("Wallet not connected.");

      const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC || "";

      if (charity.mode !== "direct") {
        throw new Error("This charity uses an external donation flow (link out).");
      }

      const n = Number(amount);
      if (!Number.isFinite(n) || n <= 0) throw new Error("Enter a valid amount.");

      setStatus("Sending...");

      const wallet = { publicKey, sendTransaction };

      const result =
        asset === "SOL"
          ? await donateSol({ connection, wallet, charityId, amountSol: n, rpcUrl })
          : await donateUsdc({ connection, wallet, charityId, amountUsdc: n, rpcUrl });

      setStatus(`Success: ${result.explorerUrl}`);
    } catch (e: any) {
      setStatus(e?.message ?? "Failed");
    }
  }

  return (
    <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
      <h3 style={{ marginTop: 0 }}>Donate (example)</h3>

      <label style={{ display: "block", marginBottom: 8 }}>
        Charity:
        <select
          value={charityId}
          onChange={(e) => setCharityId(e.target.value as CharityId)}
          style={{ marginLeft: 8 }}
        >
          {CHARITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.mode})
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: "block", marginBottom: 8 }}>
        Asset:
        <select value={asset} onChange={(e) => setAsset(e.target.value as any)} style={{ marginLeft: 8 }}>
          <option value="SOL">SOL</option>
          <option value="USDC">USDC</option>
        </select>
      </label>

      <label style={{ display: "block", marginBottom: 8 }}>
        Amount:
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ marginLeft: 8, width: 120 }}
        />
      </label>

      <button onClick={onDonate} disabled={!publicKey || charity.mode !== "direct"}>
        Donate
      </button>

      {charity.mode !== "direct" && (
        <p style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
          This charity is link-out only. Use the charity’s official donation page.
        </p>
      )}

      {status && <p style={{ marginTop: 8 }}>{status}</p>}
    </div>
  );
}
