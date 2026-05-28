"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type Flash = {
    message: string;
    type: "success" | "error";
};

const AUTO_HIDE_MS = 4200;

export default function AuthFlash() {
    const [flash, setFlash] = useState<Flash | null>(null);

    useEffect(() => {
        const consumeFlash = () => {
            const rawFlash = sessionStorage.getItem("auth_flash");
            if (!rawFlash) return;

            try {
                setFlash(JSON.parse(rawFlash) as Flash);
            } catch {
                setFlash(null);
            }

            sessionStorage.removeItem("auth_flash");
        };

        consumeFlash();
        window.addEventListener("auth-flash", consumeFlash);

        return () => {
            window.removeEventListener("auth-flash", consumeFlash);
        };
    }, []);

    useEffect(() => {
        if (!flash) return;

        const timeout = window.setTimeout(() => setFlash(null), AUTO_HIDE_MS);

        return () => window.clearTimeout(timeout);
    }, [flash]);

    if (!flash) return null;

    return (
        <div className="fixed right-4 top-20 z-[100] flex max-w-sm items-start gap-3 rounded-xl border border-white/20 bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-2xl">
            <div className={`absolute inset-y-3 left-0 w-1 rounded-r-full ${flash.type === "success" ? "bg-emerald-400" : "bg-red-400"}`} />
            <p className="pl-2 pr-1">{flash.message}</p>
            <button
                type="button"
                aria-label="Đóng thông báo"
                onClick={() => setFlash(null)}
                className="mt-0.5 rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
                <X className="h-4 w-4" aria-hidden="true" />
            </button>
        </div>
    );
}
