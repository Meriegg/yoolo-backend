import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { DiamondModeMessageTypes } from './types';

@WebSocketGateway({ cors: true })
export class DiamondModeGateway {
  @SubscribeMessage(DiamondModeMessageTypes.UpdatePos)
  updatePos(socket: Socket, data: any) {
    socket.broadcast.emit(DiamondModeMessageTypes.UpdatePos, data);
  }
}
