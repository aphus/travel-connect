import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('trips/:tripId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findByTrip(@Param('tripId') tripId: string) {
    return this.messagesService.findByTrip(tripId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param('tripId') tripId: string,
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateMessageDto,
  ) {
    return this.messagesService.create(tripId, user.sub, dto);
  }
}
