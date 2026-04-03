import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/webrtc',
})
export class WebRTCGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private rooms: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove client from all rooms
    this.rooms.forEach((clients, room) => {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        if (clients.size === 0) {
          this.rooms.delete(room);
        } else {
          // Notify other clients in the room
          client.to(room).emit('peer-disconnected', { peerId: client.id });
        }
      }
    });
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string; userType: 'student' | 'admin' },
  ) {
    const { roomId, userId, userType } = data;
    client.join(roomId);

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(client.id);

    // Notify others in the room
    client.to(roomId).emit('peer-joined', {
      peerId: client.id,
      userId,
      userType,
    });

    // Send list of existing peers to the new client
    const existingPeers = Array.from(this.rooms.get(roomId) || [])
      .filter((id) => id !== client.id)
      .map((id) => {
        this.server.sockets.sockets.get(id);
        return {
          peerId: id,
          // You can store user info in socket data
        };
      });

    if (existingPeers.length > 0) {
      client.emit('existing-peers', existingPeers);
    }

    return { success: true, roomId, peers: Array.from(this.rooms.get(roomId) || []) };
  }

  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; offer: RTCSessionDescriptionInit; targetPeerId: string },
  ) {
    const { roomId, offer, targetPeerId } = data;
    client.to(targetPeerId).emit('offer', {
      offer,
      fromPeerId: client.id,
    });
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; answer: RTCSessionDescriptionInit; targetPeerId: string },
  ) {
    const { answer, targetPeerId } = data;
    client.to(targetPeerId).emit('answer', {
      answer,
      fromPeerId: client.id,
    });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; candidate: RTCIceCandidateInit; targetPeerId: string },
  ) {
    const { candidate, targetPeerId } = data;
    client.to(targetPeerId).emit('ice-candidate', {
      candidate,
      fromPeerId: client.id,
    });
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    const { roomId } = data;
    client.leave(roomId);

    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId)!.delete(client.id);
      if (this.rooms.get(roomId)!.size === 0) {
        this.rooms.delete(roomId);
      }
    }

    const { roomId: rId } = data;
    this.server.to(rId).emit('peer-left', { peerId: client.id });
    return { success: true };
  }
}

