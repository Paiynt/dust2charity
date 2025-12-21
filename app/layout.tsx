import SolanaProviders from "../components/SolanaProviders";

export const metadata = {
  title: "Dust2Charity",
  description: "Donate leftover SOL to charity"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
        <SolanaProviders>{children}</SolanaProviders>
      </body>
    </html>
  );
}
