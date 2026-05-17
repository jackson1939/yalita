"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Share2, Download, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useQuipuStore } from "@/stores/quipu.store";

interface QRBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "cobrar" | "pagar_cuota" | "pagar_qr";
}

export function QRBottomSheet({ isOpen, onClose, mode }: QRBottomSheetProps) {
  const [activeTab, setActiveTab] = useState<"cobrar" | "pagar_cuota" | "pagar_qr">("cobrar");
  const [chargeAmount, setChargeAmount] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [merchantName, setMerchantName] = useState("Comercio Vecino");
  const [isScanning, setIsScanning] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [chargeSuccess, setChargeSuccess] = useState(false);
  const [toast, setToast] = useState("");

  const activeLoan = useQuipuStore((s) => s.activeLoan);
  const balanceBs = useQuipuStore((s) => s.getBalanceBs());
  const payInstallment = useQuipuStore((s) => s.payInstallment);
  const receiveQRPayment = useQuipuStore((s) => s.receiveQRPayment);

  const canAfford = Number(payAmount) <= balanceBs;

  // Use the mode prop if provided, otherwise use internal tab state
  const currentTab = mode || activeTab;

  useEffect(() => {
    if (mode === "pagar_cuota" && activeLoan) {
      setPayAmount(String(activeLoan.monthlyPaymentBs));
    }
    if (mode === "pagar_qr") {
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 1500); // Simular escaneo
    }
  }, [mode, activeLoan]);

  if (!isOpen) return null;

  const qrData: Record<string, string> = {
    type: "Yalita_payment",
    userId: "user_mock",
    version: "1",
  };
  if (chargeAmount) qrData.amountBs = chargeAmount;
  const qrPayload = JSON.stringify(qrData);

  const handleShare = async () => {
    const shareData = {
      title: "Pago Yalita",
      text: "Pagame con QR Yalita",
      url: `https://Yalita.app/pay?data=${encodeURIComponent(qrPayload)}`,
    };
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(shareData.url);
      setToast("Link copiado ✓");
      setTimeout(() => setToast(""), 2500);
    }
  };

  // Simulate receiving a QR payment (for demo)
  const handleSimulateCharge = () => {
    const amount = Number(chargeAmount);
    if (!amount || amount <= 0) return;
    receiveQRPayment(amount, "Cliente");
    setChargeSuccess(true);
    setTimeout(() => {
      setChargeSuccess(false);
      setChargeAmount("");
    }, 2500);
  };

  const handlePay = () => {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) return;
    setPayLoading(true);
    
    setTimeout(() => {
      if (currentTab === "pagar_cuota") {
        payInstallment(amount);
      } else {
        // Pago QR general (Billetera)
        useQuipuStore.getState().receiveQRPayment(-amount, merchantName); // Usamos monto negativo para indicar egreso
      }
      
      setPayLoading(false);
      setPaySuccess(true);
      setTimeout(() => {
        setPaySuccess(false);
        setPayAmount("");
        onClose();
      }, 2500);
    }, 2000);
  };

  const openPayTab = () => {
    setActiveTab("pagar_qr");
    if (activeLoan) {
      setPayAmount(String(activeLoan.monthlyPaymentBs));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div
        className="relative w-full max-w-[430px] rounded-t-3xl animate-slideUp z-10"
        style={{
          maxHeight: "85vh",
          backgroundColor: "#F5F0E8",
          overflowY: "auto",
        }}
      >
        {/* Drag Handle */}
        <div className="sticky top-0 pt-3 pb-2 flex justify-center bg-[#F5F0E8] z-10">
          <div className="w-12 h-1 bg-quipu-text/20 rounded-full" />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-quipu-text/5 z-20"
        >
          <X size={18} className="text-quipu-text/60" />
        </button>

        {/* Tabs - Only show if mode is not forced */}
        {!mode && (
          <div className="flex mx-6 mt-2 mb-6 bg-quipu-text/5 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("cobrar")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                currentTab === "cobrar"
                  ? "bg-white text-quipu-dark shadow-sm"
                  : "text-quipu-text/50"
              }`}
            >
              Cobrar
            </button>
            <button
              onClick={openPayTab}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                currentTab === "pagar_qr"
                  ? "bg-white text-quipu-dark shadow-sm"
                  : "text-quipu-text/50"
              }`}
            >
              Pagar
            </button>
          </div>
        )}

        <div className="px-6 pb-10">
          {/* ─── TAB COBRAR ─── */}
          {currentTab === "cobrar" && (
            <div className="space-y-5">
              {chargeSuccess ? (
                <div className="text-center py-8 animate-fadeInUp">
                  <CheckCircle2
                    size={56}
                    className="text-quipu-accent mx-auto mb-4"
                  />
                  <p className="font-serif text-2xl text-quipu-dark mb-2">
                    ¡Cobro registrado!
                  </p>
                  <p className="text-sm text-quipu-text/60">
                    Bs {Number(chargeAmount).toLocaleString()} añadidos a tu
                    saldo
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <h3 className="font-serif text-xl text-quipu-dark mb-1">
                      Tu código para cobrar
                    </h3>
                    <p className="text-sm text-quipu-text/60">
                      Pídele a tu cliente que escanee esto
                    </p>
                  </div>

                  {/* QR */}
                  <div className="flex justify-center">
                    <div className="bg-white p-5 rounded-2xl shadow-lg border border-quipu-text/5">
                      <QRCodeSVG
                        value={qrPayload}
                        size={200}
                        bgColor="#ffffff"
                        fgColor="#1A1A2E"
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                  </div>

                  {/* Monto opcional */}
                  <div>
                    <label className="block text-xs font-bold text-quipu-text/50 uppercase tracking-wider mb-2">
                      Monto a cobrar (opcional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-quipu-text/40">
                        Bs
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={chargeAmount}
                        onKeyDown={(e) => ["-", "e", "E"].includes(e.key) && e.preventDefault()}
                        onChange={(e) => setChargeAmount(e.target.value)}
                        placeholder="Sin monto fijo"
                        className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-quipu-text/10 font-bold text-quipu-dark focus:outline-none focus:border-quipu-primary placeholder:font-normal placeholder:text-quipu-text/30"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center justify-center space-x-2 py-3.5 bg-quipu-primary text-white rounded-xl font-bold transition-all active:scale-[0.97]"
                  >
                    <Share2 size={18} />
                    <span>Compartir QR</span>
                  </button>

                  {/* Simulate charge button for demo */}
                  {chargeAmount && Number(chargeAmount) > 0 && (
                    <button
                      onClick={handleSimulateCharge}
                      className="w-full flex items-center justify-center space-x-2 py-3 bg-quipu-accent/10 rounded-xl text-sm font-bold text-quipu-accent transition-all active:scale-[0.97]"
                    >
                      <span>⚡ Simular cobro de Bs {chargeAmount}</span>
                    </button>
                  )}

                  <button className="w-full flex items-center justify-center space-x-2 py-3 bg-quipu-dark/5 rounded-xl text-sm font-bold text-quipu-dark transition-all active:scale-[0.97]">
                    <Download size={16} />
                    <span>Guardar imagen</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* ─── TAB PAGAR CUOTA ─── */}
          {currentTab === "pagar_cuota" && (
            <div className="space-y-5">
              {!activeLoan ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">💰</div>
                  <h3 className="font-serif text-xl text-quipu-dark mb-2">
                    No tienes préstamos activos
                  </h3>
                  <p className="text-sm text-quipu-text/60 mb-6">
                    ¿Quieres solicitar uno?
                  </p>
                  <Link
                    href="/prestamos/calculadora"
                    onClick={onClose}
                    className="inline-block bg-quipu-secondary text-quipu-dark font-bold px-6 py-3 rounded-xl transition-all active:scale-[0.97]"
                  >
                    Ver calculadora de préstamos
                  </Link>
                </div>
              ) : paySuccess ? (
                <div className="text-center py-8 animate-fadeInUp">
                  <CheckCircle2
                    size={56}
                    className="text-quipu-accent mx-auto mb-4"
                  />
                  <p className="font-serif text-2xl text-quipu-dark mb-2">
                    ¡Pagaste Bs {Number(payAmount).toLocaleString()}!
                  </p>
                  <p className="text-sm text-quipu-text/60">
                    Tu score subió 12 puntos 🎉
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <h3 className="font-serif text-xl text-quipu-dark mb-1">
                      Pagar cuota
                    </h3>
                    <p className="text-sm text-quipu-text/60">
                      Cuota:{" "}
                      <span className="font-bold text-quipu-dark">
                        Bs {activeLoan.monthlyPaymentBs.toLocaleString()}
                      </span>{" "}
                      · {activeLoan.paidInstallments}/{activeLoan.termMonths}{" "}
                      pagadas
                    </p>
                  </div>

                  <div className="h-2 bg-quipu-text/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-quipu-accent rounded-full transition-all"
                      style={{
                        width: `${
                          (activeLoan.paidInstallments /
                            activeLoan.termMonths) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold text-quipu-text/50 uppercase tracking-wider">
                        Monto a pagar
                      </label>
                      <span className="text-[10px] font-bold text-quipu-text/40">
                        Saldo: Bs {balanceBs.toLocaleString()}
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-quipu-text/40">
                        Bs
                      </span>
                      <input
                        type="number"
                        min="0"
                        onKeyDown={(e) => ["-", "e", "E"].includes(e.key) && e.preventDefault()}
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        className={`w-full pl-12 pr-4 py-4 bg-white rounded-xl border font-bold text-xl focus:outline-none ${
                          !canAfford ? "border-red-500 text-red-500" : "border-quipu-text/10 text-quipu-dark focus:border-quipu-primary"
                        }`}
                      />
                    </div>
                    {!canAfford && (
                      <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">
                        ⚠️ Saldo insuficiente en tu billetera
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handlePay}
                    disabled={payLoading || !Number(payAmount) || !canAfford}
                    className="w-full bg-quipu-primary hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all flex justify-center items-center space-x-2 active:scale-[0.97]"
                  >
                    {payLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>{!canAfford ? "Saldo insuficiente" : "Confirmar pago"}</span>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ─── TAB PAGAR QR (BILLETERA) ─── */}
          {currentTab === "pagar_qr" && (
            <div className="space-y-5">
              {isScanning ? (
                <div className="text-center py-12">
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <div className="absolute inset-0 border-2 border-quipu-primary rounded-2xl animate-pulse" />
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-quipu-primary animate-scan-line shadow-[0_0_15px_rgba(192,57,43,0.8)]" />
                    <div className="flex items-center justify-center h-full opacity-20">
                      <QRCodeSVG value="scanning..." size={120} />
                    </div>
                  </div>
                  <h3 className="font-serif text-xl text-quipu-dark mb-2">Escanenado QR...</h3>
                  <p className="text-sm text-quipu-text/60">Apunta la cámara al código</p>
                </div>
              ) : paySuccess ? (
                <div className="text-center py-8 animate-fadeInUp">
                  <CheckCircle2 size={56} className="text-quipu-accent mx-auto mb-4" />
                  <p className="font-serif text-2xl text-quipu-dark mb-2">¡Pago enviado!</p>
                  <p className="text-sm text-quipu-text/60">Enviaste Bs {Number(payAmount).toLocaleString()} a {merchantName}</p>
                </div>
              ) : (
                <div className="animate-fadeInUp">
                  <div className="flex items-center space-x-4 mb-6 bg-white p-4 rounded-2xl border border-quipu-text/5">
                    <div className="w-12 h-12 bg-quipu-light rounded-full flex items-center justify-center text-xl">🏬</div>
                    <div>
                      <p className="text-xs font-bold text-quipu-text/40 uppercase">Pagando a</p>
                      <p className="font-bold text-quipu-dark">{merchantName}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold text-quipu-text/50 uppercase tracking-wider">Monto a enviar</label>
                      <span className="text-[10px] font-bold text-quipu-text/40">
                        Saldo: Bs {balanceBs.toLocaleString()}
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-quipu-text/40">Bs</span>
                      <input
                        type="number"
                        min="0"
                        onKeyDown={(e) => ["-", "e", "E"].includes(e.key) && e.preventDefault()}
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        placeholder="0.00"
                        className={`w-full pl-12 pr-4 py-4 bg-white rounded-xl border font-bold text-2xl focus:outline-none ${
                          !canAfford ? "border-red-500 text-red-500" : "border-quipu-text/10 text-quipu-dark focus:border-quipu-primary"
                        }`}
                      />
                    </div>
                    {!canAfford && (
                      <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">
                        ⚠️ No tienes suficiente saldo para este pago
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handlePay}
                    disabled={payLoading || !Number(payAmount) || !canAfford}
                    className="w-full bg-quipu-primary hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all flex justify-center items-center space-x-2 active:scale-[0.97]"
                  >
                    {payLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>{!canAfford ? "Saldo insuficiente" : `Enviar Bs ${payAmount || "0"}`}</span>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => { setIsScanning(true); setTimeout(() => setIsScanning(false), 1500); }}
                    className="w-full mt-3 text-sm font-bold text-quipu-text/50 hover:text-quipu-dark"
                  >
                    Volver a escanear
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 left-4 right-4 max-w-[400px] mx-auto bg-quipu-dark text-white py-3 px-4 rounded-xl shadow-xl text-sm font-medium text-center animate-fadeInUp z-50">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
