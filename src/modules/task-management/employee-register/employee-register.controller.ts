import { Body, Controller, Delete, Get, Post, Put, Query, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { InsertEmployeeDto } from 'src/models/dto/register-employee.dto';
import { EmployeeRegisterService } from './employee-register.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {Response} from "express";
import  * as path from "path";
import { ApiBody, ApiConsumes } from "@nestjs/swagger";
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

//TASK ASSIGN
@Post('upload')
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      comment: { type: 'string' },
      outletId: { type: 'integer' },
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  },
})
@UseInterceptors(FileExtender)
@UseInterceptors(FileInterceptor('file' , {
  storage : diskStorage({
    destination : "./uploads",
    filename : (req , file , cb) => {
      cb(null , `${file.originalname}`)
    }
  })
}))

uploadFile2(@UploadedFile('file') file) {
  console.log(file);
}
@Get('getFile')
async getFile(@Res() res: Response, @Query('file') fileName: string): Promise<void> {
  const filePath = path.join(`D:/Rks-project/RKS/server/uploads/${fileName}`);
  console.log(filePath);
  
  try {
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('File not found');
    }
  } catch (err) {
    console.error('Error retrieving file:', err);
    res.status(500).send('Server Error');
  }
}
}
