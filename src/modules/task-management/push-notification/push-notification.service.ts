import { Injectable } from '@nestjs/common';
import * as webPush from 'web-push';
import { dbConnection } from 'src/app.module';

@Injectable()
export class PushNotificationService {
  private readonly vapidKeys = {
    publicKey: 'BGwdw00ND8PykBD4bvVa5GeNtC3UfHQ9aDINzR92-hRd6XT3xhyvejA6B4K1zma9txXF_HeAuZBepWAfEBpoghI',
    privateKey: 's3lB4aCF_G1wCOK3NpEAhUzh8lW2g39udGQNlHCOdSM',
  };

  private subscriptionMessages: Map<string, any> = new Map();

  constructor() {
    webPush.setVapidDetails(
      'mailto:example@yourdomain.org',
      this.vapidKeys.publicKey,
      this.vapidKeys.privateKey,
    );
  }

  addSubscription(subscription: any, message: any) {
    const key = JSON.stringify(subscription); 
    this.subscriptionMessages.set(key, message);
  }
  private async getEmployeeNames(senderId: number, receiverId: number) {
    const sender = await dbConnection.query(`
      SELECT employee_name FROM task_management.employee_register WHERE empId = ${senderId};
    `);
    const receiver = await dbConnection.query(`
      SELECT employee_name FROM task_management.employee_register WHERE empId = ${receiverId};
    `);
    return {
      senderName: sender[0]?.employee_name || 'Unknown Sender',
      receiverName: receiver[0]?.employee_name || 'Unknown Receiver',
    };
  }
  private createPayload(title: string, message: any) {
    return JSON.stringify({
      notification: {
        title: title,
        body: message.message,
        data: { url: "https://www.youtube.com/watch?v=0vSEmEdYKro&list=PL4cSPhAvl8xUHh6ojmhFDGdMQmJWFcxrc&index=4" },
        icon: "https://th.bing.com/th/id/OIP.GRs93gl6W99txaf4ScCoNQAAAA?rs=1&pid=ImgDetMain",
      }
    });
  }

  async sendNotification() {
    for (const [subscriptionKey, message] of this.subscriptionMessages.entries()) {
      const subscription = JSON.parse(subscriptionKey); 
      const { senderName, receiverName } = await this.getEmployeeNames(message.sender_id, message.receiver_id);
      const title = `Message from ${senderName} to ${receiverName}`;
      const payload = this.createPayload(title, message);
    

      try {
        await webPush.sendNotification(subscription, payload);
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
    this.subscriptionMessages.clear();
  }
}
