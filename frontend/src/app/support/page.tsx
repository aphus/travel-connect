import { HelpCircle, Mail, MessageCircle, Phone } from "lucide-react";

const supportItems = [
    {
        icon: Mail,
        title: "Email hỗ trợ",
        value: "support@tripconnect.vn",
        body: "Phù hợp với các yêu cầu về tài khoản, báo lỗi, phản hồi tính năng hoặc hỗ trợ xử lý báo cáo.",
    },
    {
        icon: Phone,
        title: "Hotline",
        value: "1900 2026",
        body: "Thời gian hỗ trợ tham khảo: 08:00 đến 18:00 từ thứ 2 đến thứ 7.",
    },
    {
        icon: MessageCircle,
        title: "Trung tâm trợ giúp",
        value: "Phản hồi trong 24 giờ",
        body: "Gửi mô tả vấn đề, ảnh chụp màn hình nếu có và đường dẫn chuyến đi để đội hỗ trợ kiểm tra nhanh hơn.",
    },
];

const faqs = [
    "Nếu không tham gia được chuyến, hãy kiểm tra trạng thái chuyến, số lượng thành viên và yêu cầu duyệt của leader.",
    "Nếu gặp người dùng có hành vi không phù hợp, bạn có thể dùng chức năng báo cáo trên hồ sơ hoặc trong trang chuyến đi.",
    "Nếu thông tin chuyến bị sai, leader nên chỉnh sửa trước ngày khởi hành để thành viên nắm rõ lịch trình.",
];

export default function SupportPage() {
    return (
        <div className="bg-slate-50">
            <section className="container mx-auto max-w-5xl px-6 py-12">
                <div className="mb-8">
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase text-blue-600">
                        <HelpCircle className="h-4 w-4" />
                        Hỗ trợ
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
                        Hỗ trợ khách hàng
                    </h1>
                    <p className="mt-3 max-w-3xl text-slate-600">
                        Liên hệ TripConnect khi bạn cần hỗ trợ tài khoản, chuyến đi, báo cáo người dùng hoặc góp ý trải nghiệm.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {supportItems.map(({ icon: Icon, title, value, body }) => (
                        <article key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                                <Icon className="h-5 w-5" />
                            </div>
                            <h2 className="font-bold text-slate-900">{title}</h2>
                            <p className="mt-1 font-semibold text-blue-600">{value}</p>
                            <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
                        </article>
                    ))}
                </div>

                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-3 font-bold text-slate-900">Câu hỏi thường gặp</h2>
                    <ul className="space-y-3 text-sm leading-6 text-slate-600">
                        {faqs.map((faq) => (
                            <li key={faq} className="rounded-lg bg-slate-50 px-4 py-3">
                                {faq}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
}
