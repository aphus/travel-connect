import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { MessagesService } from '../messages/messages.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

type AuthenticatedSocket = Socket & {
  data: {
    user?: JwtPayload;
  };
};

type JoinTripPayload = {
  tripId: string;
};

type SendMessagePayload = {
  tripId: string;
  content: string;
};

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly messagesService: MessagesService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractToken(client);

      if (!token) {
        client.emit('chat:error', {
          message: 'Missing authentication token',
        });
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      client.data.user = payload;

      this.logger.log(`Socket connected: ${client.id}, userId=${payload.sub}`);
    } catch (error) {
      this.logger.warn(`Socket auth failed: ${client.id}`);
      client.emit('chat:error', {
        message: 'Invalid or expired authentication token',
      });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data.user?.sub ?? 'anonymous';
    this.logger.log(`Socket disconnected: ${client.id}, userId=${userId}`);
  }

  @SubscribeMessage('ping')
  handlePing(
    @MessageBody() body: { message: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    this.logger.log(`Ping from ${client.id}: ${body.message}`);

    return {
      success: true,
      message: 'pong',
      received: body,
      socketId: client.id,
      userId: client.data.user?.sub,
      timestamp: new Date().toISOString(),
    };
  }

  @SubscribeMessage('join_trip')
  async handleJoinTrip(
    @MessageBody() body: JoinTripPayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const userId = this.getAuthenticatedUserId(client);
    const tripId = this.validateTripId(body.tripId);

    await this.messagesService.ensureCanAccessTrip(tripId, userId);

    const room = this.getTripRoom(tripId);
    await client.join(room);

    this.logger.log(`User ${userId} joined room ${room}`);

    return {
      success: true,
      event: 'join_trip',
      room,
    };
  }

  @SubscribeMessage('leave_trip')
  async handleLeaveTrip(
    @MessageBody() body: JoinTripPayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const tripId = this.validateTripId(body.tripId);
    const room = this.getTripRoom(tripId);

    await client.leave(room);

    return {
      success: true,
      event: 'leave_trip',
      room,
    };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() body: SendMessagePayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const userId = this.getAuthenticatedUserId(client);
    const tripId = this.validateTripId(body.tripId);
    const content = body.content?.trim();

    if (!content) {
      throw new WsException('Message content cannot be empty');
    }

    const message = await this.messagesService.create(tripId, userId, {
      content,
    });

    const room = this.getTripRoom(tripId);

    this.server.to(room).emit('message:new', message);

    return {
      success: true,
      event: 'send_message',
      messageId: message.id,
    };
  }

  private extractToken(client: Socket) {
    const authToken = client.handshake.auth?.token;

    if (typeof authToken === 'string' && authToken.trim()) {
      return authToken.trim();
    }

    const header = client.handshake.headers.authorization;

    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.slice(7);
    }

    return null;
  }

  private getAuthenticatedUserId(client: AuthenticatedSocket) {
    const userId = client.data.user?.sub;

    if (!userId) {
      throw new WsException('Unauthenticated socket');
    }

    return userId;
  }

  private validateTripId(tripId: string) {
    if (!tripId || typeof tripId !== 'string') {
      throw new WsException('tripId is required');
    }

    return tripId;
  }

  private getTripRoom(tripId: string) {
    return `trip:${tripId}`;
  }
}
