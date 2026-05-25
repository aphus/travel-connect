# Interaction & Trust API Specification

## Messages

### GET /api/trips/:tripId/messages
Lấy lịch sử tin nhắn của một trip.

Permission:
- User phải là active member của trip.

### Socket Event: joinTripRoom
Client gửi:
{
  "tripId": "uuid"
}

Server trả:
- joinedTripRoom
- chatError

### Socket Event: sendTripMessage
Client gửi:
{
  "tripId": "uuid",
  "content": "string"
}

Server broadcast:
- newTripMessage

---

## Trip Lifecycle

### PATCH /api/trips/:tripId/mark-completed
Leader đánh dấu chuyến đi đã kết thúc.

Permission:
- Chỉ leader của trip.

Result:
- status = waiting_confirmation

### POST /api/trips/:tripId/confirm-completion
Member xác nhận chuyến đi đã hoàn thành.

Permission:
- Chỉ active member, không phải leader.

Result:
- Nếu có ít nhất 1 confirmation → status = completed

---

## Reviews

### POST /api/reviews
Tạo đánh giá.

Body:
{
  "tripId": "uuid",
  "revieweeId": "uuid",
  "rating": 5,
  "comment": "string"
}

Rules:
- Trip phải completed.
- Reviewer và reviewee phải cùng trip.
- Không được tự review.
- Chỉ review 1 lần / 1 người / 1 trip.

### GET /api/users/:userId/reviews
Lấy danh sách review của một user.

---

## Reports

### POST /api/reports
Tạo báo cáo người dùng.

Body:
{
  "tripId": "uuid",
  "reportedId": "uuid",
  "reason": "spam | scam | toxic | cancel_last_minute",
  "description": "string"
}

Rules:
- Reporter và reported user phải cùng trip.
- Không được report chính mình.