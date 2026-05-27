"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Flash = {
    message: string;
    type: "success" | "error";
};

export default function AuthFlash() {
    const pathname = usePathname();
    const [flash, setFlash] = useState<Flash | null>(null);

    useEffect(() => {
        let timeout: number | undefined;

        const consumeFlash = () => {
            const rawFlash = sessionStorage.getItem("auth_flash");
            if (!rawFlash) return;

            try {
                setFlash(JSON.parse(rawFlash) as Flash);
            } catch {
                setFlash(null);
            }

            sessionStorage.removeItem("auth_flash");
            if (timeout) window.clearTimeout(timeout);
            timeout = window.setTimeout(() => setFlash(null), 4200);
        };

        consumeFlash();
        window.addEventListener("auth-flash", consumeFlash);

        return () => {
            window.removeEventListener("auth-flash", consumeFlash);
            if (timeout) window.clearTimeout(timeout);
        };
    }, [pathname]);

    if (!flash) return null;

    return (
        <div className="fixed right-4 top-20 z-[100] max-w-sm rounded-xl border border-white/20 bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-2xl">
            <div className={`absolute inset-y-3 left-0 w-1 rounded-r-full ${flash.type === "success" ? "bg-emerald-400" : "bg-red-400"}`} />
            <p className="pl-2">{flash.message}</p>
        </div>
    );
}
