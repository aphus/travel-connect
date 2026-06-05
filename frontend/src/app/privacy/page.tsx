import { Database, LockKeyhole, UserCheck } from "lucide-react";

const policies = [
    {
        icon: UserCheck,
        title: "Thông tin được thu thập",
        body: "TripConnect lưu các thông tin cần thiết như tên hiển thị, email, ảnh đại diện, chuyến đi đã tạo hoặc tham gia, tin nhắn và đánh giá để vận hành nền tảng.",
    },
    {
        icon: Database,
        title: "Mục đích sử dụng",
        body: "Dữ liệu được dùng để xác thực tài khoản, gợi ý chuyến phù hợp, hiển thị hồ sơ tin cậy, hỗ trợ xử lý báo cáo và cải thiện trải nghiệm sử dụng.",
    },
    {
        icon: LockKeyhole,
        title: "Bảo vệ dữ liệu",
        body: "Chúng tôi giới hạn quyền truy cập dữ liệu trong hệ thống, không bán thông tin cá nhân và khuyến khích người dùng không chia sẻ thông tin nhạy cảm trong chat.",
    },
];

export default function PrivacyPage() {
    return (
        <div className="bg-slate-50">
            <section className="container mx-auto max-w-5xl px-6 py-12">
                <div className="mb-8">
                    <div className="mb-3 text-sm font-bold uppercase text-blue-600">
                        Quyền riêng tư
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
                        Chính sách bảo mật
                    </h1>
                    <p className="mt-3 max-w-3xl text-slate-600">
                        Chính sách này giải thích cách TripConnect xử lý thông tin cá nhân ở mức cơ bản khi bạn sử dụng nền tảng.
                    </p>
                </div>

                <div className="space-y-4">
                    {policies.map(({ icon: Icon, title, body }) => (
                        <article key={title} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900">{title}</h2>
                                <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
                            </div>
                        </article>
                    ))}
                </div>

                <p className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600">
                    Người dùng có thể cập nhật thông tin hồ sơ trong tài khoản cá nhân. Khi cần hỗ trợ về dữ liệu hoặc quyền riêng tư, vui lòng liên hệ bộ phận hỗ trợ khách hàng.
                </p>
            </section>
        </div>
    );
}
