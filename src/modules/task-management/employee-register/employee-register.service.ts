import { HttpStatus, Injectable } from '@nestjs/common';
import { dbConnection } from 'src/app.module';
import { InsertEmployeeInterface } from 'src/models/interface/register-employee.interface';
import * as mysql from 'mysql2';
import ResponseInterface from 'src/models/interface/response.interface';
import { ResponseMessageEnum } from 'src/models/enum/response-message.enum';
import { EMPTY } from 'rxjs';
@Injectable()
export class EmployeeRegisterService {
  constructor() {

  }
  //LOGIN & LOGOUT
  async loginMethod(
    employee_name: string,
    employee_password: string
  ): Promise<ResponseInterface> {
    try {
      const data = await dbConnection.query(`
            SELECT * FROM task_management.employee_register 
            WHERE employee_name=${mysql.escape(employee_name)} 
            AND employee_password=${mysql.escape(employee_password)}
          `);

      if (data.length > 0) {
        const empId = data[0].empId;
        const { employee_password, employee_confirmpassword, ...result } = data[0];

        const loginDateTime = new Date(); // Get current datetime
        const formattedLoginDateTime = loginDateTime.toISOString().slice(0, 19).replace('T', ' '); // Format to YYYY-MM-DD HH:MM:SS

        // Insert login datetime into login_and_logout table
        await dbConnection.query(`
                    INSERT INTO task_management.login_and_logout (login_date_time, empId)
                    VALUES (${mysql.escape(formattedLoginDateTime)}, ${mysql.escape(empId)})
                `);
        return {
          statusCode: HttpStatus.OK,
          message: ResponseMessageEnum.GET,
          data: result
        };
      } else {
        return {
          statusCode: HttpStatus.OK,
          message: ResponseMessageEnum.GET,
          data: []
        };
      }
    } catch (error) {
      throw error;
    }
  }
  async logoutMethod(empId: number): Promise<ResponseInterface> {
    try {
      const logoutDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');


      await dbConnection.query(`
              UPDATE task_management.login_and_logout
              SET logout_date_time = ${mysql.escape(logoutDateTime)}
              WHERE empId = ${mysql.escape(empId)}
              ORDER BY login_logout_id DESC
              LIMIT 1
          `);

      return {
        statusCode: HttpStatus.ACCEPTED,
        message: ResponseMessageEnum.UPDATE,
        data: true
      };
    } catch (error) {
      throw error;
    }
  }
  // EMPLOYEE 
  async getEmployee(): Promise<ResponseInterface> {
    try {
      const data = await dbConnection.query(`
            SELECT * FROM task_management.employee_register 
            
          `);

      return {
        statusCode: HttpStatus.OK,
        message: ResponseMessageEnum.GET,
        data: data
      };
    } catch (error) {
      throw error;
    }
  }
  async registerEmployee(employeeDetails: InsertEmployeeInterface): Promise<ResponseInterface> {
    try {

      const employeeRole = JSON.stringify(employeeDetails.employee_role);
      const employeeAccess = JSON.stringify(employeeDetails.employee_access);
      console.log(employeeDetails);

      const employeeDateOfJoin = new Date(employeeDetails.employee_dateofjoin).toISOString().slice(0, 19).replace('T', ' ');
      console.log(employeeDateOfJoin);

      await dbConnection.query(`
            INSERT INTO task_management.employee_register
            (
              employee_name,
              employee_designation,
              employee_cabinno,
              employee_dateofjoin,
              employee_address,
              employee_contactno,
              employee_password,
              employee_confirmpassword,
              employee_role,
              employee_access
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
        employeeDetails.employee_name,
        employeeDetails.employee_designation,
        employeeDetails.employee_cabinno,
        employeeDateOfJoin,
        employeeDetails.employee_address,
        employeeDetails.employee_contactno,
        employeeDetails.employee_password,
        employeeDetails.employee_confirmpassword,
        employeeRole,
        employeeAccess
      ]);

      return {
        statusCode: HttpStatus.ACCEPTED,
        message: ResponseMessageEnum.ADD,
        data: true
      };
    } catch (error) {
      throw error;
    }

  }
  async updateEmployee(
    empId: number,
    employeeDetails: InsertEmployeeInterface
  ): Promise<ResponseInterface> {
    try {
      await dbConnection.query(`
            UPDATE task_management.employee_register 
            SET
              employee_name = ${mysql.escape(employeeDetails.employee_name)},
              employee_designation = ${mysql.escape(employeeDetails.employee_designation)},
              employee_cabinno = ${mysql.escape(employeeDetails.employee_cabinno)},
              employee_dateofjoin = ${mysql.escape(employeeDetails.employee_dateofjoin)},
              employee_address = ${mysql.escape(employeeDetails.employee_address)},
              employee_contactno = ${mysql.escape(employeeDetails.employee_contactno)},
              employee_password = ${mysql.escape(employeeDetails.employee_password)},
              employee_confirmpassword = ${mysql.escape(employeeDetails.employee_confirmpassword)},
              employee_role = ${mysql.escape(JSON.stringify(employeeDetails.employee_role))}, 
              employee_access = ${mysql.escape(JSON.stringify(employeeDetails.employee_access))}
            WHERE empId = ${mysql.escape(empId)}
          `);
      return {
        statusCode: HttpStatus.ACCEPTED,
        message: ResponseMessageEnum.UPDATE,
        data: true
      };
    } catch (error) {
      throw error;
    }
  }
  async removeEmployee(
    empId: number,
  ): Promise<ResponseInterface> {
    try {
      await dbConnection.query(`
          DELETE FROM task_management.employee_register WHERE empId=${mysql.escape(empId)}
            `);
      return {
        statusCode: HttpStatus.OK,
        message: ResponseMessageEnum.DELETE,
        data: true
      }
    } catch (error) {
      throw error;
    }
  }

  //EMPLOYEE ATTENDANCE
  async employeeAttendance(): Promise<ResponseInterface> {
    try {

      const data = await dbConnection.query(`
       SELECT 
       er.empId,
    er.employee_name,
    er.employee_designation,
    er.employee_cabinno AS cabinNo,
    DATE_FORMAT(ll.login_date_time, '%Y-%m-%d %H:%i:%s') AS login_date_time,
    DATE_FORMAT(ll.logout_date_time, '%Y-%m-%d %H:%i:%s') AS logout_date_time
FROM 
    task_management.employee_register er
JOIN 
    task_management.login_and_logout ll ON er.empId = ll.empId;

          `);
      return {
        statusCode: HttpStatus.ACCEPTED,
        message: ResponseMessageEnum.UPDATE,
        data: data
      };
    } catch (error) {
      throw error;
    }
  }
  //TASK ASSIGN

  // async createTask(createTaskDto: CreateTaskDto, files: Express.Multer.File[]): Promise<Task> {
  //   const task = new Task();
  //   task.projectName = createTaskDto.projectName;
  //   task.startDate = new Date(createTaskDto.startDate);
  //   task.endDate = new Date(createTaskDto.endDate);
  //   task.projectStatus = createTaskDto.projectStatus;
  //   task.taskName = createTaskDto.taskName;
  //   task.deadline = new Date(createTaskDto.deadline);
  //   task.assignTo = createTaskDto.assignTo;

  //   // Save files to database or storage system
  //   task.fileAttachments = files.map(file => file.filename); // Store filenames in the database

  //   // Save task details to the database
  //   return this.taskRepository.save(task);
  // }
}