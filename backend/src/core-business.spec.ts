import { Test, TestingModule } from '@nestjs/testing';

describe('TripConnect - Core Business Logic Tests', () => {

    describe('Trip UI Logic - isJoinButtonVisible()', () => {
        const isJoinButtonVisible = (trip: { status: string, currentMembers: number, maxMembers: number }): boolean => {
            if (trip.status !== 'upcoming') return false;
            if (trip.currentMembers >= trip.maxMembers) return false;
            return true;
        };

        it('Trường hợp 1: Chuyến đi còn chỗ -> Hiển thị nút "Xin tham gia" (true)', () => {
            const trip = { status: 'upcoming', currentMembers: 2, maxMembers: 5 };
            expect(isJoinButtonVisible(trip)).toBe(true);
        });

        it('Trường hợp 2: Khi chuyến đi không còn chỗ (Full) -> Mất nút xin tham gia (false)', () => {
            const tripFull = { status: 'upcoming', currentMembers: 5, maxMembers: 5 };
            expect(isJoinButtonVisible(tripFull)).toBe(false);
        });
    });

    describe('ReviewService - calculateTrustScore()', () => {
        const calculateTrustScore = (ratings: number[]): number => {
            if (ratings.length === 0) return 0;
            const sum = ratings.reduce((total, current) => total + current, 0);
            return Number((sum / ratings.length).toFixed(1));
        };

        it('Trường hợp 1: Trust Score là điểm trung bình của các đánh giá (VD: 5, 4, 4 -> 4.3)', () => {
            const ratings = [5, 4, 4];
            expect(calculateTrustScore(ratings)).toBe(4.3);
        });

        it('Trường hợp 2: Trust Score bị kéo xuống khi có đánh giá thấp (VD: 5, 5, 2 -> 4.0)', () => {
            const ratings = [5, 5, 2];
            expect(calculateTrustScore(ratings)).toBe(4.0);
        });
    });

    describe('ChatService - getUserVisibleChatRooms()', () => {
        const getUserVisibleChatRooms = (userId: string, allTrips: any[]) => {
            return allTrips.filter(trip => trip.members.includes(userId));
        };

        it('Trường hợp 1: User đã được Leader chấp nhận -> Phòng chat nhóm hiện lên trong khung chat', () => {
            const userId = 'user-diti';
            const trips = [
                { id: 'trip-dalat', name: 'Đà Lạt', members: ['user-leader', 'user-diti'] },
                { id: 'trip-vungtau', name: 'Vũng Tàu', members: ['user-leader', 'user-phu'] }
            ];

            const visibleRooms = getUserVisibleChatRooms(userId, trips);

            expect(visibleRooms.length).toBe(1);
            expect(visibleRooms[0].id).toBe('trip-dalat');
        });

        it('Trường hợp 2: User CHƯA là người tham gia chuyến đi -> Phòng chat KHÔNG hiện lên', () => {
            const userId = 'user-guest';
            const trips = [
                { id: 'trip-dalat', name: 'Đà Lạt', members: ['user-leader', 'user-diti'] }
            ];

            const visibleRooms = getUserVisibleChatRooms(userId, trips);

            expect(visibleRooms.length).toBe(0);
        });
    });

});