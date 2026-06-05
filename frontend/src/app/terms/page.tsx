import { CheckCircle2, FileText, ShieldCheck } from "lucide-react";

const terms = [
    {
        title: "Tài khoản và thông tin cá nhân",
        body: "Người dùng cần cung cấp thông tin cơ bản chính xác khi đăng ký, tự bảo mật mật khẩu và chịu trách nhiệm với hoạt động phát sinh từ tài khoản của mình.",
    },
    {
        title: "Tạo và tham gia chuyến đi",
        body: "Thông tin chuyến đi như điểm đến, thời gian, ngân sách và số lượng thành viên cần được mô tả trung thực để các thành viên khác có thể cân nhắc trước khi tham gia.",
    },
    {
        title: "Ứng xử trong cộng đồng",
        body: "TripConnect không chấp nhận nội dung lừa đảo, quấy rối, xúc phạm, spam hoặc hành vi gây mất an toàn cho thành viên trong quá trình trao đổi và đi cùng nhau.",
    },
    {
        title: "Đánh giá và độ uy tín",
        body: "Điểm tin cậy và đánh giá được dùng để tham khảo chất lượng tương tác. Người dùng nên đánh giá khách quan, dựa trên trải nghiệm thực tế sau chuyến đi.",
    },
];

export default function TermsPage() {
    return (
        <div className="bg-slate-50">
            <section className="container mx-auto max-w-5xl px-6 py-12">
                <div className="mb-8">
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase text-blue-600">
                        <FileText className="h-4 w-4" />
                        TripConnect
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
                        Điều khoản sử dụng
                    </h1>
                    <p className="mt-3 max-w-3xl text-slate-600">
                        Những nguyên tắc cơ bản giúp cộng đồng ghép nhóm du lịch hoạt động minh bạch, văn minh và an toàn hơn.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {terms.map((item) => (
                        <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                {item.title}
                            </div>
                            <p className="text-sm leading-6 text-slate-600">{item.body}</p>
                        </article>
                    ))}
                </div>

                <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-900">
                    <div className="mb-2 flex items-center gap-2 font-bold">
                        <ShieldCheck className="h-5 w-5" />
                        Lưu ý
                    </div>
                    TripConnect có thể tạm khóa hoặc xử lý tài khoản vi phạm nghiêm trọng để bảo vệ trải nghiệm chung của cộng đồng.
                </div>
            </section>
        </div>
    );
}
