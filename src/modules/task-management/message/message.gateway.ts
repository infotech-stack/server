import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { MessagesService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import{Server,Socket} from 'socket.io'
@WebSocketGateway({
  cors:{
    origin:'*'
  },
})
@WebSocketGateway(4000)
export class MessagesGateway {
  // @WebSocketServer()
  // server :Server;
  // constructor(private readonly messagesService: MessagesService) {}

  // @SubscribeMessage('createMessage')
  // async create(@MessageBody() createMessageDto: CreateMessageDto,
  // @ConnectedSocket() client:Socket) {
  //   const message=await this.messagesService.create(createMessageDto,client.id);
  //   this.server.emit('message',message);
  //   return message;
  // }

  // @SubscribeMessage('findAllMessages')
  // async findAll() {
  //   return this.messagesService.findAll();
  // }

 
  // @SubscribeMessage('join')
  // async  joinRoom(@MessageBody('name') name:string,@ConnectedSocket() client:Socket) 
  // {
  //   this.messagesService.identify(name,client.id);
  // }
  // @SubscribeMessage('typing')
  // async typing(@MessageBody('isTyping') isTyping:boolean,@ConnectedSocket() client:Socket) {
  // const name=await this.messagesService.getClientname(client.id);
  // client.broadcast.emit('typing',{name,isTyping});
  // }
  private server: Server;

  afterInit(server: Server) {
    this.server = server;
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: any): void {
    console.log('Message received:', data);
    this.server.emit('message', data);
  }
}
