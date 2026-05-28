import { Controller, Get, Param, Patch } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findMine(@CurrentUser() user: { sub: string }) {
    return this.notificationsService.findMine(user.sub);
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: { sub: string }) {
    return this.notificationsService.unreadCount(user.sub);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser() user: { sub: string }) {
    return this.notificationsService.markAllAsRead(user.sub);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.notificationsService.markAsRead(id, user.sub);
  }
}
