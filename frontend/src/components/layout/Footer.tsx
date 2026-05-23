import React from 'react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="w-full border-t bg-slate-50 text-slate-600 py-6 mt-auto">
            <div className="container flex flex-col md:flex-row items-center justify-between px-6 md:px-8 gap-4 text-sm text-center md:text-left">
                <div>
                    <p>© 2026 <span className="font-semibold text-blue-600">TripConnect</span>. Nền tảng kết nối du lịch và hành trình đáng tin cậy.</p>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-slate-500">
                    <Link href="/terms" className="hover:text-blue-600 transition-colors">Điều khoản sử dụng</Link>
                    <Link href="/privacy" className="hover:text-blue-600 transition-colors">Chính sách bảo mật</Link>
                    <Link href="/support" className="hover:text-blue-600 transition-colors">Hỗ trợ khách hàng</Link>
                </div>
            </div>
        </footer>
    );
}