import TripDetail from "@/components/trip/TripDetail";

export default function TripPage({ params }: { params: { id: string } }) {
    // Giả lập dữ liệu (Backend sẽ đổ vào đây sau)
    const tripData = {
        title: "Khám phá Đà Lạt",
        description: "Lịch trình cụ thể...",
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Gọi Component chúng ta vừa tạo ở Bước 1 */}
            <TripDetail tripId={params.id} tripData={tripData} />
        </div>
    );
}