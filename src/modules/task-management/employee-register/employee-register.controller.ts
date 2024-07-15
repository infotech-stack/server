import { Body, Controller, Delete, Get, Post, Put, Query, Res, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import {  GetTaskByRolesDto, InsertEmployeeDto, TaskAssignDto } from 'src/models/dto/register-employee.dto';
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
@Get('get-employee')
async getEmployee(){
    try {
      return  this._employeeRegisterService.getEmployee();
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
//   await this._employeeRegisterService.createTask(taskAssignDto, fileNames);
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
@ApiQuery({ name: 'empId', type: Number })
@ApiBody({ type: GetTaskByRolesDto })
async getTasksByRole(@Query('empId') empId: number, @Body() getTasksByRoleDto: GetTaskByRolesDto) {
  const { roles } = getTasksByRoleDto;
  return this._employeeRegisterService.getTasksByRole(empId, roles);
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

}
