import Image from 'next/image';
import Link from 'next/link';

export default function Logo({ isWhite }: { isWhite: boolean }) {
    return (
        <Link href="/" className="flex items-center gap-3 transition-transform hover:opacity-90">
            <div className="relative w-18 h-18">
                <Image
                    src="/images/logo1.png"
                    alt="TripConnect Logo"
                    fill
                    sizes="48px"
                    className="object-contain"
                />
            </div>

            <div className="flex flex-col leading-none">
                <span className={`text-2xl font-black tracking-tighter ${isWhite ? "text-white drop-shadow-md" : "text-slate-900"}`}>
                    Trip<span className="text-blue-600">Connect</span>
                </span>
            </div>
        </Link>
    );
}