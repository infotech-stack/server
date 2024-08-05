import { Controller, Get, Post, Body, Query, Res, HttpStatus, UseInterceptors, UploadedFiles, Put, Delete } from '@nestjs/common';
import { MessagesService } from './messages.service';
import * as path from 'path';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { Request, Response } from 'express';
import { ApiConsumes } from '@nestjs/swagger';

@Controller('messages')
export class MessageController {
  constructor(private _messageService: MessagesService) {
    // this.ensureUploadsPathExists();
  }
  @Post('post-message')
  saveMessage(@Body() message: any) {
    try {


      return this._messageService.saveMessage(message)
    } catch (error) {
      throw error;
    }
  }
  @Get('get-message')
  getMessages(@Query('sender_id') sender_id: number, @Query('receiver_id') receiver_id: number) {
    try {
      return this._messageService.getMessages(sender_id, receiver_id);
    } catch (error) {
      throw error;
    }
  }

//   @Post('upload-files')
//   @UseInterceptors(FileFieldsInterceptor([
//     { name: 'files', maxCount: 10 }
//   ], {
//     storage: diskStorage({
//       destination: (req: Request, file, cb) => {
//         const senderId = req.body.senderId as string;
//         const receiverId = req.body.receiverId as string;
//         console.log(req.body, 'body')
//         console.log(senderId, receiverId, 'id');

//         const dir = path.join(__dirname, '..', '..', 'src', 'assets', 'uploads');
//         cb(null, dir);
//       },
//       filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//       }
//     })
//   }))
//   async uploadFiles(
//     @UploadedFiles() files: { files?: Express.Multer.File[] },
//     @Body() taskAssignDto: { senderId: string, receiverId: string }
//   ) {
//     console.log(taskAssignDto);
//     const fileNames = files.files?.map(file => file.filename) || [];

//     return {
//       message: 'Files uploaded successfully',
//       data: fileNames
//     };
//   }
//   ensureUploadsPathExists() {
//     const uploadPath = path.resolve(__dirname, '..', '..', 'src', 'assets', 'uploads');
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }
//   }
//   @Get('download-files')
//   async getFile(
//     @Res() res: Response,
//     @Query('senderId') senderId: string,
//     @Query('receiverId') receiverId: string,
//     @Query('filename') filename: string): Promise<void> {
//     const filePath = path.join(__dirname, '..', '..', 'src', 'assets', 'uploads', filename);
//     console.log(filePath);


//     try {
//       if (fs.existsSync(filePath)) {
//         res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
//         res.sendFile(filePath);
//       } else {
//         res.status(HttpStatus.NOT_FOUND).send('File not found');
//       }
//     } catch (err) {
//       console.error('Error retrieving file:', err);
//       res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Server Error');
//     }
//   }
@Post('upload-files')
@ApiConsumes('multipart/form-data')
@UseInterceptors(FileFieldsInterceptor([
  { name: 'files', maxCount: 10 }
], {
  storage: diskStorage({
    destination: (req: Request, file, cb) => {
      // Extract employee IDs from `assignTo` field
      const assignTo = req.body.assignTo as string;
      let empIds: number[] = [];

      try {
        empIds = JSON.parse(assignTo).map((id: any) => Number(id));
      } catch (e) {
        return cb(new Error('Invalid employee IDs format'), null);
      }

      if (!empIds.length) {
        return cb(new Error('No employee IDs provided'), null);
      }

      // Create directories for each employee ID
      empIds.forEach(empId => {
        const uploadDir = path.join(__dirname, '..', '..', 'src', 'assets', 'uploads', empId.toString());
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
      });

      // Use the directory of the first employee ID as the destination
      const primaryEmpId = empIds[0];
      const uploadDir = path.join(__dirname, '..', '..', 'src', 'assets', 'uploads', primaryEmpId.toString());
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const empId = JSON.parse(req.body.assignTo)[0]; // Get the first employee ID
      const filename = `${empId}-${file.originalname}`;
      cb(null, filename);
    }
  })
}))
async uploadFiles(
  @UploadedFiles() files: { files?: Express.Multer.File[] },
  @Body() body: { projectName: string, startDate: any, endDate: any, projectStatus: any, assignTo: string, messageDescription: string }
) {
  const fileNames = files.files?.map(file => file.filename) || [];
  return {
    message: 'Files uploaded successfully',
    data: fileNames
  };
}

@Get('download-files')
async downloadFile(
  @Res() res: Response,
  @Query('empId') empId: string,
  @Query('filename') filename: string
): Promise<void> {
  // Construct the file path
  const filePath = path.join(__dirname, '..', '..', 'src', 'assets', 'uploads', empId, filename);

  try {
    // Check if the file exists
    if (fs.existsSync(filePath)) {
      // Set the appropriate headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.sendFile(filePath);
    } else {
      res.status(HttpStatus.NOT_FOUND).send('File not found');
    }
  } catch (err) {
    console.error('Error retrieving file:', err);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Server Error');
  }
}
}