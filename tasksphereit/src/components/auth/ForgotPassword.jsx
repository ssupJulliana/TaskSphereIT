import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import LoginHeader from "../common/LoginHeader.jsx";
import LoginFooter from "../common/LoginFooter.jsx";
import { Eye, EyeOff } from "lucide-react";

const maroon = "#6A0F14";

/* ===== Small OTP input group (6 boxes) ===== */
function OTP6({ value, onChange }) {
  const inputsRef = useRef([]);
  const vals = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const setIdx = (i, v) => {
    const next = [...vals];
    next[i] = v.slice(-1);
    onChange(next.join(""));
  };

  const handleChange = (e, i) => {
    const v = e.target.value.replace(/\D/g, "");
    if (!v) {
      setIdx(i, "");
      return;
    }
    setIdx(i, v[0]);
    if (i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace" && !vals[i] && i > 0) inputsRef.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) inputsRef.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    onChange(text.padEnd(6, ""));
    const last = Math.min(text.length, 6) - 1;
    if (last >= 0) inputsRef.current[last]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex items-center gap-3" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          inputMode="numeric"
          maxLength={1}
          value={vals[i]}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-12 h-12 text-center text-xl rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#6A0F14]/40 outline-none"
        />
      ))}
    </div>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email"); // 'email' | 'code' | 'reset'
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  const [otp, setOtp] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  // ====== Email step (static send) ======
  const submitEmail = (e) => {
    e.preventDefault();
    setErr("");
    setNote("");
    if (!email.trim()) {
      setErr("Please enter your email.");
      return;
    }
    // Static: pretend we sent an email
    setNote(`A 6-digit code was sent to ${email.trim()}.`);
    setStep("code");
  };

  // ====== Verify code step (static verify) ======
  const verifyCode = (e) => {
    e.preventDefault();
    setErr("");
    if (otp.length !== 6) {
      setErr("Enter the 6-digit code.");
      return;
    }
    // Static accept
    setStep("reset");
  };

  // ====== Reset password step (static) ======
  const submitReset = (e) => {
    e.preventDefault();
    setErr("");
    if (newPwd.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setErr("Passwords do not match.");
      return;
    }
    alert("Password changed successfully.");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (step === "code") {
      setTimeout(() => {
        const first = document.querySelector('input[inputmode="numeric"]');
        first?.focus();
      }, 0);
    }
  }, [step]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LoginHeader />

      <div className="flex-1 grid place-items-center px-6 py-10">
        <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-2xl shadow-lg p-8 md:p-10">
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-800">
            {step === "email" && "Reset your password"}
            {step === "code" && "Verify your email"}
            {step === "reset" && "Create a new password"}
          </h1>
          <div className="h-[2px] w-full mt-3" style={{ backgroundColor: maroon }} />

          {/* EMAIL STEP */}
          {step === "email" && (
            <form onSubmit={submitEmail} className="mt-6 space-y-5">
              <p className="text-sm text-neutral-600">
                Enter your account email and we’ll send a 6-digit code to verify it.
              </p>
              <div>
                <label className="block text-sm font-medium text-neutral-700">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/50"
                />
              </div>
              {err && <p className="text-sm text-red-600">{err}</p>}
              {note && !err && <p className="text-sm text-green-600">{note}</p>}
              <button
                type="submit"
                className="mt-2 w-full rounded-full px-6 py-3 text-white font-medium hover:opacity-95 active:scale-[.99] bg-[#6A0F14]"
              >
                Send reset link
              </button>
              <div className="text-sm mt-4">
                <Link to="/login" className="text-[#6A0F14] hover:underline">
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          )}

          {/* CODE STEP */}
          {step === "code" && (
            <form onSubmit={verifyCode} className="mt-6 space-y-6">
              <p className="text-sm text-neutral-600">
                We sent a 6-digit code to <span className="font-medium">{email}</span>. Enter it below.
              </p>
              <OTP6 value={otp} onChange={setOtp} />
              {err && <p className="text-sm text-red-600">{err}</p>}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-sm px-3 py-2 rounded-md border border-neutral-300 hover:bg-neutral-100"
                >
                  ← Change email
                </button>
                <button
                  type="submit"
                  className="rounded-full px-6 py-3 text-white font-medium hover:opacity-95 active:scale-[.99] bg-[#6A0F14]"
                >
                  Verify
                </button>
              </div>
              <p className="text-xs text-neutral-500">
                Didn’t get it? Check spam or{" "}
                <button
                  type="button"
                  onClick={() => alert("Resent (static).")}
                  className="text-[#6A0F14] hover:underline"
                >
                  resend code
                </button>
                .
              </p>
            </form>
          )}

          {/* RESET STEP */}
          {step === "reset" && (
            <form onSubmit={submitReset} className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700">New Password</label>
                <div className="relative">
                  <input
                    type={show1 ? "text" : "password"}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="At least 8 characters"
                    className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShow1((s) => !s)}
                    className="absolute inset-y-0 right-0 grid place-items-center px-3 text-neutral-500 hover:text-neutral-700"
                    aria-label={show1 ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {show1 ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">Confirm Password</label>
                <div className="relative">
                  <input
                    type={show2 ? "text" : "password"}
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    placeholder="Re-enter new password"
                    className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShow2((s) => !s)}
                    className="absolute inset-y-0 right-0 grid place-items-center px-3 text-neutral-500 hover:text-neutral-700"
                    aria-label={show2 ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {show2 ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {err && <p className="text-sm text-red-600">{err}</p>}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("code")}
                  className="text-sm px-3 py-2 rounded-md border border-neutral-300 hover:bg-neutral-100"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="rounded-full px-6 py-3 text-white font-medium hover:opacity-95 active:scale-[.99] bg-[#6A0F14]"
                >
                  Change password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <LoginFooter />
    </div>
  );
}
