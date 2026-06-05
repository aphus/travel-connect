"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getAuthErrorMessage,
  loginUser,
  requestPasswordReset,
  resetPasswordWithOtp,
  setAuthFlash,
  storeAuthUser,
  verifyResetOtp,
} from "@/services/auth";
import { setAccessToken, validateStoredToken } from "@/services/fetchWrapper";

type ForgotPasswordStep = "email" | "otp" | "reset";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotPasswordStep>("email");
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const redirectIfAuthenticated = async () => {
      if (await validateStoredToken()) {
        if (isMounted) router.replace("/");
      }
    };

    void redirectIfAuthenticated();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await loginUser({
        email: email.trim(),
        password,
      });

      setAccessToken(response.accessToken);
      storeAuthUser(response.user);
      setAuthFlash(`Đăng nhập thành công. Xin chào ${response.user.fullName}!`);
      router.push("/");
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForgotState = () => {
    setForgotStep("email");
    setResetEmail("");
    setResetOtp("");
    setResetNewPassword("");
    setResetConfirmPassword("");
    setForgotError("");
    setForgotMessage("");
    setIsForgotSubmitting(false);
  };

  const handleForgotOpenChange = (open: boolean) => {
    setIsForgotOpen(open);
    if (open) {
      setResetEmail(email.trim());
      setForgotError("");
      setForgotMessage("");
      return;
    }

    resetForgotState();
  };

  const handleRequestOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setForgotError("");
    setForgotMessage("");

    const normalizedEmail = resetEmail.trim();
    if (!normalizedEmail) {
      setForgotError("Vui lòng nhập email tài khoản.");
      return;
    }

    setIsForgotSubmitting(true);

    try {
      await requestPasswordReset({ email: normalizedEmail });
      setResetEmail(normalizedEmail);
      setForgotStep("otp");
      setForgotMessage("OTP đã được gửi. Vui lòng kiểm tra hộp thư nhận OTP.");
    } catch (error) {
      setForgotError(getAuthErrorMessage(error));
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setForgotError("");
    setForgotMessage("");

    if (resetOtp.trim().length !== 6) {
      setForgotError("OTP phải gồm 6 chữ số.");
      return;
    }

    setIsForgotSubmitting(true);

    try {
      await verifyResetOtp({ email: resetEmail, otp: resetOtp.trim() });
      setResetOtp(resetOtp.trim());
      setForgotStep("reset");
      setForgotMessage("OTP chính xác. Bạn có thể đặt mật khẩu mới.");
    } catch (error) {
      setForgotError(getAuthErrorMessage(error));
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setForgotError("");
    setForgotMessage("");

    if (resetNewPassword.length < 6) {
      setForgotError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setForgotError("Mật khẩu nhập lại không khớp.");
      return;
    }

    setIsForgotSubmitting(true);

    try {
      await resetPasswordWithOtp({
        email: resetEmail,
        otp: resetOtp,
        newPassword: resetNewPassword,
      });
      setEmail(resetEmail);
      setPassword("");
      setForgotMessage(
        "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại.",
      );
      window.setTimeout(() => handleForgotOpenChange(false), 900);
    } catch (error) {
      setForgotError(getAuthErrorMessage(error));
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const getForgotDialogTitle = () => {
    if (forgotStep === "otp") return "Nhập mã OTP";
    if (forgotStep === "reset") return "Tạo mật khẩu mới";
    return "Quên mật khẩu";
  };

  const getForgotDialogDescription = () => {
    if (forgotStep === "otp") {
      return "Nhập mã OTP gồm 6 chữ số được gửi tới hộp thư nhận OTP.";
    }

    if (forgotStep === "reset") {
      return "Mật khẩu mới sẽ được cập nhật cho tài khoản bạn đã xác thực.";
    }

    return "Nhập đúng email tài khoản trong hệ thống để nhận mã OTP đặt lại mật khẩu.";
  };

  return (
    <form onSubmit={handleLogin} className="w-full space-y-5">
      <div className="space-y-2">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            autoComplete="email"
            placeholder="Email của bạn"
            className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 pl-12 rounded-2xl focus-visible:ring-blue-500 focus-visible:bg-white/20 transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            autoComplete="current-password"
            placeholder="Mật khẩu"
            className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 pl-12 rounded-2xl focus-visible:ring-blue-500 focus-visible:bg-white/20 transition-all"
          />
        </div>
        <div className="text-right">
          <button
            type="button"
            onClick={() => handleForgotOpenChange(true)}
            className="text-xs text-white/60 hover:text-white"
          >
            Quên mật khẩu?
          </button>
        </div>
      </div>

      {errorMessage && (
        <p
          className="rounded-xl bg-red-500/15 border border-red-300/30 px-4 py-3 text-sm font-medium text-red-100"
          role="alert"
          aria-live="polite"
        >
          {errorMessage}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-70"
      >
        {isSubmitting ? (
          "ĐANG XỬ LÝ..."
        ) : (
          <>
            ĐĂNG NHẬP <LogIn className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>

      <Dialog open={isForgotOpen} onOpenChange={handleForgotOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{getForgotDialogTitle()}</DialogTitle>
            <DialogDescription>
              {getForgotDialogDescription()}
            </DialogDescription>
          </DialogHeader>

          {forgotStep === "email" && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <Input
                type="email"
                value={resetEmail}
                onChange={(event) => setResetEmail(event.target.value)}
                placeholder="Email tài khoản"
                autoComplete="email"
                className="h-11"
              />
              <ForgotFeedback error={forgotError} message={forgotMessage} />
              <DialogFooter>
                <Button type="submit" disabled={isForgotSubmitting}>
                  {isForgotSubmitting ? "Đang gửi..." : "Gửi OTP"}
                </Button>
              </DialogFooter>
            </form>
          )}

          {forgotStep === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <Input
                value={resetOtp}
                onChange={(event) =>
                  setResetOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Nhập OTP 6 số"
                inputMode="numeric"
                className="h-11 text-center text-lg font-bold tracking-[0.35em]"
              />
              <ForgotFeedback error={forgotError} message={forgotMessage} />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForgotStep("email")}
                >
                  Đổi email
                </Button>
                <Button type="submit" disabled={isForgotSubmitting}>
                  {isForgotSubmitting ? "Đang kiểm tra..." : "Xác nhận OTP"}
                </Button>
              </DialogFooter>
            </form>
          )}

          {forgotStep === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                type="password"
                value={resetNewPassword}
                onChange={(event) => setResetNewPassword(event.target.value)}
                placeholder="Mật khẩu mới"
                autoComplete="new-password"
                className="h-11"
              />
              <Input
                type="password"
                value={resetConfirmPassword}
                onChange={(event) =>
                  setResetConfirmPassword(event.target.value)
                }
                placeholder="Nhập lại mật khẩu mới"
                autoComplete="new-password"
                className="h-11"
              />
              <ForgotFeedback error={forgotError} message={forgotMessage} />
              <DialogFooter>
                <Button type="submit" disabled={isForgotSubmitting}>
                  {isForgotSubmitting ? "Đang cập nhật..." : "Đổi mật khẩu"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </form>
  );
}

function ForgotFeedback({
  error,
  message,
}: {
  error: string;
  message: string;
}) {
  if (error) {
    return (
      <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
        {error}
      </p>
    );
  }

  if (message) {
    return (
      <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
        {message}
      </p>
    );
  }

  return null;
}
