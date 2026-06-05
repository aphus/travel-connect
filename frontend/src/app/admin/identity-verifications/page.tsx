"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  approveIdentityVerification,
  getIdentityVerificationRequests,
  rejectIdentityVerification,
  type AdminIdentityVerificationRequest,
} from "@/services/admin";
import { getStoredAuthUser } from "@/services/auth";
import { ApiError, clearAccessToken } from "@/services/fetchWrapper";

const STATUS_LABEL: Record<string, string> = {
  pending: "Đang chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Đã từ chối",
};

export default function AdminIdentityVerificationsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<AdminIdentityVerificationRequest[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [rejectTarget, setRejectTarget] =
    useState<AdminIdentityVerificationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleRequestError = useCallback(
    (requestError: unknown, fallback: string) => {
      if (
        requestError instanceof ApiError &&
        [401, 403].includes(requestError.status)
      ) {
        clearAccessToken();
        router.replace("/admin/login");
        return;
      }

      setError(
        requestError instanceof ApiError ? requestError.message : fallback,
      );
    },
    [router],
  );

  useEffect(() => {
    let isMounted = true;
    const user = getStoredAuthUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "admin")) {
      router.replace("/admin/login");
      return () => {
        isMounted = false;
      };
    }

    void getIdentityVerificationRequests("pending")
      .then((data) => {
        if (!isMounted) return;
        setRequests(Array.isArray(data) ? data : []);
      })
      .catch((requestError) => {
        if (!isMounted) return;
        handleRequestError(
          requestError,
          "Không thể tải danh sách yêu cầu xác minh.",
        );
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [handleRequestError, router]);

  const handleApprove = async (request: AdminIdentityVerificationRequest) => {
    const confirmed = window.confirm(
      "Sau khi duyệt, tài liệu sẽ bị xóa khỏi nơi lưu trữ. Bạn có chắc chắn?",
    );
    if (!confirmed) return;

    try {
      setActionLoadingId(request.id);
      setError("");
      setMessage("");
      const result = await approveIdentityVerification(request.id);

      setRequests((currentRequests) =>
        currentRequests.filter((item) => item.id !== request.id),
      );
      setMessage(result.message || "Đã duyệt yêu cầu xác minh danh tính.");
    } catch (requestError) {
      handleRequestError(requestError, "Duyệt yêu cầu thất bại.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;

    if (!rejectReason.trim()) {
      setError("Vui lòng nhập lý do từ chối.");
      return;
    }

    const confirmed = window.confirm(
      "Sau khi từ chối, tài liệu sẽ bị xóa khỏi nơi lưu trữ.",
    );
    if (!confirmed) return;

    try {
      setActionLoadingId(rejectTarget.id);
      setError("");
      setMessage("");
      const result = await rejectIdentityVerification(
        rejectTarget.id,
        rejectReason.trim(),
      );

      setRequests((currentRequests) =>
        currentRequests.filter((item) => item.id !== rejectTarget.id),
      );
      setMessage(result.message || "Đã từ chối yêu cầu xác minh danh tính.");
      setRejectTarget(null);
      setRejectReason("");
    } catch (requestError) {
      handleRequestError(requestError, "Từ chối yêu cầu thất bại.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="flex items-center gap-3 text-3xl font-black tracking-tight text-slate-800">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
            Xác minh danh tính
          </h2>
          <p className="mt-1 text-slate-500">
            Kiểm duyệt tài liệu định danh demo do người dùng gửi lên.
          </p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
          Tài liệu định danh chỉ được dùng cho mục đích kiểm duyệt và sẽ bị xóa
          sau khi xử lý.
        </div>
      </div>

      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="relative min-h-[420px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80">
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-slate-500">
              Đang tải yêu cầu xác minh...
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-6 py-4">Người gửi</th>
                <th className="px-6 py-4">Ngày gửi</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ảnh tài liệu demo</th>
                <th className="px-6 py-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((request) => {
                const fullName =
                  request.user.full_name ||
                  request.user.fullName ||
                  request.user.email;
                const submittedAt = request.submitted_at
                  ? new Date(request.submitted_at).toLocaleString("vi-VN")
                  : "N/A";

                return (
                  <tr
                    key={request.id}
                    className="align-top transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold uppercase text-blue-700">
                          {fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{fullName}</p>
                          <p className="text-xs font-medium text-slate-500">
                            {request.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {submittedAt}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                        <Clock className="h-3.5 w-3.5" />
                        {STATUS_LABEL[request.status] || request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {request.document_url ? (
                        <a
                          href={request.document_url}
                          target="_blank"
                          rel="noreferrer"
                          className="group block w-56 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm"
                          aria-label={`Xem tài liệu demo của ${fullName}`}
                        >
                          <div
                            className="flex h-32 items-end justify-end bg-cover bg-center"
                            style={{
                              backgroundImage: `url("${request.document_url}")`,
                            }}
                          >
                            <span className="m-2 inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-1 text-xs font-bold text-white opacity-90 transition-opacity group-hover:opacity-100">
                              <Eye className="h-3.5 w-3.5" />
                              Xem
                            </span>
                          </div>
                        </a>
                      ) : (
                        <div className="flex h-32 w-56 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs font-bold text-slate-400">
                          Không có tài liệu
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(request)}
                          disabled={actionLoadingId === request.id}
                          className="inline-flex min-w-[92px] items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionLoadingId === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Duyệt
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectTarget(request);
                            setRejectReason("");
                            setError("");
                            setMessage("");
                          }}
                          disabled={actionLoadingId === request.id}
                          className="inline-flex min-w-[92px] items-center justify-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <XCircle className="h-4 w-4" />
                          Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!isLoading && requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-400" />
                    <p className="text-lg font-bold text-slate-700">
                      Không có yêu cầu xác minh nào đang chờ duyệt.
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Các tài liệu đã xử lý sẽ được backend xóa khỏi nơi lưu trữ
                      và database.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
              <h3 className="text-lg font-bold text-slate-800">
                Từ chối xác minh danh tính
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {rejectTarget.user.full_name ||
                  rejectTarget.user.fullName ||
                  rejectTarget.user.email}
              </p>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                Sau khi từ chối, tài liệu sẽ bị xóa khỏi nơi lưu trữ.
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Lý do từ chối
                </span>
                <textarea
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Ví dụ: Ảnh demo không rõ thông tin hoặc không phù hợp."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setRejectTarget(null);
                    setRejectReason("");
                  }}
                  disabled={actionLoadingId === rejectTarget.id}
                  className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-60"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={actionLoadingId === rejectTarget.id}
                  className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoadingId === rejectTarget.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Xác nhận từ chối"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
