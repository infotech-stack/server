export interface InsertMessagesInterface{
    sender_id: number;
    receiver_id: number;
    message?: string;
    timestamp?:Date;
    filename?:string[];
    is_deleted:number;
    fileUrl?: string;
    // fileName?: string;
}