import { Body, Controller, Delete, Get, HttpStatus, Post, Put, Query, Res, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import {  GetTaskByRolesDto, InsertEmployeeDto,  InsertMessageDto,  TaskAssignDto, TaskReportsDto } from 'src/models/dto/register-employee.dto';
import { EmployeeRegisterService } from './employee-register.service';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {Response} from "express";
import  * as path from "path";
import { ApiBody, ApiConsumes, ApiQuery } from "@nestjs/swagger";
import { FileExtender } from "src/common/interceptors/fileExtender.interceptor";
import * as fs from 'fs';

interface FileParams {
  fileName : string;
}

@Controller('employee-register')
export class EmployeeRegisterController  {
constructor(private _employeeRegisterService:EmployeeRegisterService){
  this.ensureUploadsPathExists();
}

//LOGIN
@Get('login')
async loginMethod(@Query('employee_name') employee_name:string,@Query('employee_password') employee_password:string){
    try {
      return  this._employeeRegisterService.loginMethod(employee_name,employee_password);
    } catch (error) {
        throw error;
    }
}
@Put('logout')
async logoutMethod(@Query('empId') empId:number){
  try {
    return  this._employeeRegisterService.logoutMethod(empId);
  } catch (error) {
      throw error;
  }
}

//EMPLOYEE
// @ApiQuery({ name: 'empId', type: Number })
// @ApiBody({ type: GetTaskByRolesDto })

@Get('get-all-employee')
async getAllEmployee(){
  try {
    return await this._employeeRegisterService.getAllEmployee();
  } catch (error) {
    throw error;
  }
}
@Post('get-employee')
async getEmployee(
  @Query('empId') empId: number,
  // @Query('search') search: string,
  // @Query('sort_field') sort_field: string,
  // @Query('sort_order') sort_order: string,
  @Query('current_page') current_page: number,
  @Query('page_size') page_size: number,
  @Body() getEmployeeDto: GetTaskByRolesDto,
){
    try {
      const { roles } = getEmployeeDto;
      return  this._employeeRegisterService.getEmployee(empId,roles,current_page,page_size);
    } catch (error) {
        throw error;
    }
}
@Post('insert-employee')
async registerEmployee(@Body( ) registerDetails:InsertEmployeeDto){
    try {
      return  this._employeeRegisterService.registerEmployee(registerDetails);
    } catch (error) {
        throw error;
    }
}
@Put('update-employee')
async updateEmployee(@Query('empId') empId:number, @Body( ) registerDetails:InsertEmployeeDto){
    try {
      return  this._employeeRegisterService.updateEmployee(empId,registerDetails);
    } catch (error) {
        throw error;
    }
}
@Delete('remove-employee')
async removeEmployee(@Query('empId') empid:number){
    try {
      return  this._employeeRegisterService.removeEmployee(empid);
    } catch (error) {
        throw error;
    }
}
@Get('get-employee-role')
async getEmployeeRole(){
  try {
    return await this._employeeRegisterService.getEmployeeRole();
  } catch (error) {
    throw error;
  }
}
@Get('get-employee-access')
async getEmployeeAccess(){
  try {
    return await this._employeeRegisterService.getEmployeeAccess();
  } catch (error) {
    throw error;
  }
}
//EMPLOYEE ATTENDANCE
@Get('employee-attendance')
async getEmployeeAttendance(){
    try {
      return  this._employeeRegisterService.employeeAttendance()
    } catch (error) {
        throw error;
    }
}


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

//TASK ASSIGN
@Post('get-Tasks-ByRole')
// @ApiQuery({ name: 'empId', type: Number })
// @ApiQuery({ name: 'current_page', type: Number })
// @ApiQuery({ name: 'page_size', type: Number })
// @ApiQuery({ name: 'search', type: String })
// @ApiQuery({ name: 'sort_field', type: String })
// @ApiQuery({ name: 'sort_order', type: String })
// @ApiBody({ type: GetTaskByRolesDto })
async getTasksByRole(
  @Query('empId') empId: number,
  @Body() getTasksByRoleDto: GetTaskByRolesDto,
  @Query('current_page') current_page: number,
  @Query('page_size') page_size: number,
  // @Query('search') search: string='',
  @Query('sort_field') sort_field: string,
  @Query('sort_order') sort_order: string
 ) {
  const { roles } = getTasksByRoleDto;
  const currentPage = current_page > 0 ? current_page : 1;
  const pageSize = page_size > 0 ? page_size : 5;

  return this._employeeRegisterService.getTasksByRole( 
    empId,
    roles,
    current_page,
    page_size,
    // search,
    sort_field,
    sort_order);
}
@Post('task-assign-to-employee')
async taskAssignToEmployee(@Body() formData: TaskAssignDto) {
  try {
    return this._employeeRegisterService.taskAssignToEmployee(formData);
  } catch (error) {
    throw error;
  }
}
@Put('update-task')
async updateTask(@Query('task_id') task_id:number,@Query('empId') empId:number, @Body( ) registerDetails:TaskAssignDto){
    try {
      return  this._employeeRegisterService.updateTask(task_id,empId,registerDetails);
    } catch (error) {
        throw error;
    }
}
@Put('delete-task')
async deleteTask(@Query('task_id') task_id:number,@Query('empId') empId:number){
    try {
      return  this._employeeRegisterService.deleteTask(task_id,empId);
    } catch (error) {
        throw error;
    }
}

//EMPLOYEE SEARCH
@Get('search-employee-by-id')
async searchEmployeeById(@Query('empId') empId:number){
  try {
    return this._employeeRegisterService.searchEmployeeById(empId);
  } catch (error) {
    throw error;
  }
}
//TASK REPORTS
@Put('task-reports')
async taskReports(@Query('empId') empId:number,@Query('task_id') task_id:number,@Body() status:TaskReportsDto){
  try {
    console.log(status,'controllr');
    
    return this._employeeRegisterService.taskReports(empId,task_id,status);
  } catch (error) {
    throw error;
  }
}


// MESSAGE
@Post('upload')
@ApiConsumes('multipart/form-data')
// @ApiBody({
//   schema: {
//     type: 'object',
//     properties: {
//       assign_to: { type: 'number' },
//       send_by: { type: 'number' },
//       message_description: { type: 'string'},
//       files: {
//         type: 'array',
//         items: { type: 'string', format: 'binary' },
//       },
//     },
//   },
// })
@UseInterceptors(FileFieldsInterceptor([
  { name: 'files', maxCount: 10 }
], {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', '..', 'src', 'assets', 'uploads'));
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
}))
async uploadFiles(
  @UploadedFiles() files: { files?: Express.Multer.File[] },
  @Body() taskAssignDto: InsertMessageDto
) {
  
  console.log(taskAssignDto);
  const fileNames = files.files?.map(file => file.filename) || [];
  
  // Save fileNames and other details to your database table
  // await this._employeeRegisterService.insertMessage(
  //   taskAssignDto,    fileNames

  // );
  return { message: 'Task assigned successfully',
    data:fileNames
   };
}
ensureUploadsPathExists() {
  const uploadPath = path.resolve(__dirname, '..', '..', 'src', 'assets', 'uploads');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
}
@Get('getFile')
async getFile(@Res() res, @Query('file') fileName: string): Promise<void> {
  const filePath = path.join(__dirname, '..', '..', 'src', 'assets', 'uploads', fileName);

  try {
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(HttpStatus.NOT_FOUND).send('File not found');
    }
  } catch (err) {
    console.error('Error retrieving file:', err);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Server Error');
  }
}

@Post('post-message')
async postMessage(@Body() message:InsertMessageDto){
try {
    return this._employeeRegisterService.postMessage(message);
} catch (error) {
  throw error;
}
}

@Get('get-message')
async getMessage(@Query('empId') empId:number){
  try {
  return this._employeeRegisterService.getMessage(empId);
  } catch (error) {
    throw error;
  }
}
}
