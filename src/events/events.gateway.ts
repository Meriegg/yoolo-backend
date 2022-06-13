import {
  ConnectedSocket,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventTypes } from './types';

@WebSocketGateway({ cors: true })
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer() wss: Server;

  afterInit(server: any) {
    console.log('Initialized');
  }

  @SubscribeMessage(EventTypes.DiamondMeetRequest)
  handleMeetRequest(socket: Socket, data: any) {
    socket.to(data?.requestTo).emit(EventTypes.DiamondMeetRequest, 'request');
  }
}
