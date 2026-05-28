import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationType,
} from './entities/notification.entity';

type CreateNotificationPayload = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  targetUrl?: string | null;
  metadata?: Record<string, unknown> | null;
};

export { NotificationType };

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async create(payload: CreateNotificationPayload) {
    const notification = this.notificationsRepository.create({
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      targetUrl: payload.targetUrl ?? null,
      metadata: payload.metadata ?? null,
    });

    return this.notificationsRepository.save(notification);
  }

  findMine(userId: string) {
    return this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  unreadCount(userId: string) {
    return this.notificationsRepository
      .createQueryBuilder('notification')
      .where('notification.user_id = :userId', { userId })
      .andWhere('notification.read_at IS NULL')
      .getCount();
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền đọc thông báo này');
    }

    if (!notification.readAt) {
      notification.readAt = new Date();
      await this.notificationsRepository.save(notification);
    }

    return notification;
  }

  async markAllAsRead(userId: string) {
    await this.notificationsRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ readAt: new Date() })
      .where('user_id = :userId', { userId })
      .andWhere('read_at IS NULL')
      .execute();

    return { success: true };
  }
}
