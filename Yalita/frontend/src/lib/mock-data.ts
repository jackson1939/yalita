export const mockUser = {
  name: "María Choque",
  phone: "+591 71234567",
  ci: "**** 4567",
  score: 680,
  memberSince: "Octubre 2023",
  avatarInitial: "M",
  availableCredit: 8000,
  scoreIncrease: 15,
};

export const getMockTransactions = () => {
  const dates = [];
  for (let i = 0; i < 13; i++) {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * 60));
    dates.push(`${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`);
  }
  
  return [
    { id: "1", type: "Pago recibido", amount: 450, date: dates[0], source: "Tigo Money", isIncome: true },
    { id: "2", type: "Pago QR", amount: 120, date: dates[1], source: "SIMPLE", isIncome: false },
    { id: "3", type: "Transferencia", amount: 800, date: dates[2], source: "Banco Unión", isIncome: true },
    { id: "4", type: "Compra - Farmacorp", amount: 45, date: dates[3], source: "SIMPLE", isIncome: false },
    { id: "5", type: "Mercado Rodríguez", amount: 180, date: dates[4], source: "Tigo Money", isIncome: false },
    { id: "6", type: "Recarga de saldo", amount: 30, date: dates[5], source: "Tigo Money", isIncome: false },
    { id: "7", type: "Pago recibido", amount: 350, date: dates[6], source: "Banco Unión", isIncome: true },
    { id: "8", type: "Super Center", amount: 250, date: dates[7], source: "SIMPLE", isIncome: false },
    { id: "9", type: "YPFB - Gasolina", amount: 150, date: dates[8], source: "SIMPLE", isIncome: false },
    { id: "10", type: "Pago recibido", amount: 600, date: dates[9], source: "Tigo Money", isIncome: true },
    { id: "11", type: "Pollos Copacabana", amount: 85, date: dates[10], source: "SIMPLE", isIncome: false },
    { id: "12", type: "Factura Luz (DELAPAZ)", amount: 110, date: dates[11], source: "Banco Unión", isIncome: false },
    { id: "13", type: "Pago recibido", amount: 500, date: dates[12], source: "Tigo Money", isIncome: true },
  ];
};

export const mockProviders = [
  { id: "tigo", name: "Tigo Money", status: "connected" as const, type: "wallet" },
  { id: "sms", name: "SMS de Pagos (Bancos)", status: "connected" as const, type: "sms" },
  { id: "email", name: "Gmail (Recibos/Facturas)", status: "pending" as const, type: "email" },
];
