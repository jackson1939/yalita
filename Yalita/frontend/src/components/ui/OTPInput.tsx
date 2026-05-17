"use client";

import { useState, useRef, KeyboardEvent } from "react";

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  isError?: boolean;
}

export function OTPInput({ length = 6, onComplete, isError }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    // Allow only the last typed character
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto advance
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const currentOtp = newOtp.join("");
    if (currentOtp.length === length) {
      onComplete(currentOtp);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length).split("");
    if (pastedData.some(char => isNaN(Number(char)))) return;

    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);

    if (pastedData.length === length) {
      onComplete(newOtp.join(""));
      inputRefs.current[length - 1]?.focus();
    } else {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  return (
    <div className="flex justify-between space-x-2">
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={digit}
          ref={(el) => { inputRefs.current[index] = el; }}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 focus:outline-none transition-colors ${
            isError
              ? "border-red-500 bg-red-50 text-red-700"
              : "border-quipu-text/20 focus:border-quipu-primary bg-white text-quipu-text"
          }`}
        />
      ))}
    </div>
  );
}
