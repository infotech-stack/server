import { HttpStatus, Injectable } from '@nestjs/common';
import { dbConnection } from 'src/app.module';
import { ResponseMessageEnum } from 'src/models/enum/response-message.enum';
import { InsertMessagesInterface } from 'src/models/interface/insert-messages.interface';
import ResponseInterface from 'src/models/interface/response.interface';





@Injectable()
export class MessagesService {

  async saveMessage( message: InsertMessagesInterface):Promise<ResponseInterface>
  {
   
    const filename=JSON.stringify(message.filename);
      await dbConnection.query(`
        INSERT INTO task_management.employee_messages
        (
        sender_id,
        receiver_id,
        message,
        filename
        )
        VALUES(?,?,?,?)
        `,[
          message.sender_id,
          message.receiver_id,
          message.message,
          filename
        ]);
        return{
          statusCode:HttpStatus.CREATED,
          message:ResponseMessageEnum.ADD,
          data:message
        }
  }

  async getMessages(senderId: number, receiverId: number):Promise<ResponseInterface>{
    const messages = await dbConnection.query(`
      SELECT * FROM task_management.employee_messages
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) AND is_deleted = 0
      ORDER BY timestamp ASC;
    `, [senderId, receiverId, receiverId, senderId]);
    return{
      statusCode:HttpStatus.OK,
      message:ResponseMessageEnum.GET,
      data:messages
    }
  }

  
  
}
