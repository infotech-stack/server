import { ResponseMessageEnum } from "../enum/response-message.enum";

export default interface ResponseInterface {
  statusCode?: number;
  message: ResponseMessageEnum;
  data?: any;
}
