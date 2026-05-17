const [, , walletAddress, amountBsArg] = process.argv;

if (!walletAddress || !amountBsArg) {
  console.error("Uso: npx tsx scripts/simulate-qr-payment.ts 0x123... 500");
  process.exit(1);
}

const amountBs = Number(amountBsArg);
if (Number.isNaN(amountBs)) {
  console.error("amountBs debe ser un numero valido");
  process.exit(1);
}

async function main() {
  const response = await fetch("http://localhost:3001/webhooks/qr-payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      walletAddress,
      amountBs,
      qrPaymentId: `demo-${Date.now()}`,
    }),
  });

  const body = await response.text();
  console.log(`Status: ${response.status}`);
  console.log(body);
}

main().catch((error) => {
  console.error("Error simulando pago QR:", error);
  process.exit(1);
});
