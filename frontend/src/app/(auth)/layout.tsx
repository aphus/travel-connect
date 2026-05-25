// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full relative overflow-hidden">
            {/* Background toàn màn hình dùng chung cho cả Login & Register */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

            {/* Nội dung các trang Login/Register sẽ hiện ở đây */}
            <main className="relative z-10 w-full min-h-screen flex items-center justify-center p-4">
                {children}
            </main>
        </div>
    );
}