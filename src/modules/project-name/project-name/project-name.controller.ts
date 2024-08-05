import { Controller } from '@nestjs/common';

@Controller('project-name')
export class ProjectNameController {
    // @Post('upload')
// @ApiConsumes('multipart/form-data')
// @ApiBody({
//   schema: {
//     type: 'object',
//     properties: {
//       projectName: { type: 'string' },
//       startDate: { type: 'string', format: 'date' },
//       endDate: { type: 'string', format: 'date' },
//       projectStatus: { type: 'string' },
//       taskName: { type: 'string' },
//       assignTo: { type: 'string' },
//       fileAttachments: {
//         type: 'array',
//         items: { type: 'string', format: 'binary' },
//       },
//     },
//   },
// })
// @UseInterceptors(FileExtender)
// @UseInterceptors(FileFieldsInterceptor([
//   { name: 'fileAttachments', maxCount: 10 }
// ], {
//   storage: diskStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
//       cb(null, `${Date.now()}-${file.originalname}`);
//     }
//   })
// }))

// async uploadFiles(
//   @UploadedFiles() files: { fileAttachments?: Express.Multer.File[] },
//   @Body() taskAssignDto: TaskAssignDto
// ) {
//   console.log(taskAssignDto);
  
//   const fileNames = files.fileAttachments?.map(file => file.filename) || [];
//   // await this._employeeRegisterService.createTask(taskAssignDto, fileNames);
//   return { message: 'Task assigned successfully' };
// }
// @Get('getFile')
// async getFile(@Res() res: Response, @Query('file') fileName: string): Promise<void> {
//   const filePath = path.join(`D:/Rks-project/RKS/server/uploads/${fileName}`);
//   console.log(filePath);
  
//   try {
//     if (fs.existsSync(filePath)) {
//       res.sendFile(filePath);
//     } else {
//       res.status(404).send('File not found');
//     }
//   } catch (err) {
//     console.error('Error retrieving file:', err);
//     res.status(500).send('Server Error');
//   }
// }


// @Post('upload')
// @ApiConsumes('multipart/form-data')
// @ApiBody({
//   description: 'Upload files with project details',
//   type: UploadFilesDto,
//   required: true,
// })
// @UseInterceptors(
//   FileFieldsInterceptor(
//     [
//       { name: 'fileAttachment', maxCount: 10 }
//     ],
//     {
//       storage: diskStorage({
//         destination: (req: any, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
//           const body = req.body as any;
//           let empIds: string[] = [];
//           try {
//             empIds = JSON.parse(body.assignTo) as string[];
//           } catch (error) {
//             return cb(new Error('Invalid assignTo format'), '');
//           }

//           if (!Array.isArray(empIds)) {
//             return cb(new Error('assignTo is not an array'), '');
//           }

//           empIds.forEach(empId => {
//             const uploadDir = path.join(__dirname, '..', '..', 'src', 'assets', 'uploads', empId);
//             if (!fs.existsSync(uploadDir)) {
//               fs.mkdirSync(uploadDir, { recursive: true });
//             }
//           });

//           const primaryEmpId = empIds[0]; 
//           const uploadDir = path.join(__dirname, '..', '..', 'src', 'assets', 'uploads', primaryEmpId);
//           cb(null, uploadDir);
//         },
//         filename: (req: any, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
//           const body = req.body as any;
//           let empIds: string[] = [];
//           try {
//             empIds = JSON.parse(body.assignTo) as string[];
//           } catch (error) {
//             return cb(new Error('Invalid assignTo format'), '');
//           }

//           const empId = empIds[0]; 
//           const filename = `${empId}-${file.originalname}`;
//           cb(null, filename);
//         }
//       })
//     }
//   )
// )
// @ApiResponse({
//   status: HttpStatus.OK,
//   description: 'Files uploaded successfully',
//   type: Object,
// })
// async uploadFiles(
//   @UploadedFiles() files: { fileAttachment?: Express.Multer.File[] },
//   @Body() body: UploadFilesDto
// ) {
//   if (!files || !files.fileAttachment) {
//     return {
//       message: 'No files uploaded',
//       data: []
//     };
//   }

//   const fileNames = files.fileAttachment.map(file => file.filename);
//   return {
//     message: 'Files uploaded successfully',
//     data: fileNames
//   };
// }

// @Get('download-files')
// @ApiResponse({
//   status: HttpStatus.OK,
//   description: 'File downloaded successfully',
//   type: Buffer,
// })
// @ApiResponse({
//   status: HttpStatus.NOT_FOUND,
//   description: 'File not found',
// })
// @ApiResponse({
//   status: HttpStatus.INTERNAL_SERVER_ERROR,
//   description: 'Server error',
// })
// async downloadFile(
//   @Res() res: Response,
//   @Query('empId') empId: string,
//   @Query('filename') filename: string
// ): Promise<void> {
//   const filePath = path.join(__dirname, '..', '..', 'src', 'assets', 'uploads', empId, filename);

//   try {
//     if (fs.existsSync(filePath)) {
//       res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
//       res.sendFile(filePath);
//     } else {
//       res.status(HttpStatus.NOT_FOUND).send('File not found');
//     }
//   } catch (err) {
//     console.error('Error retrieving file:', err);
//     res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Server Error');
//   }
// }
}
