import { HttpStatus, Injectable } from '@nestjs/common';
import { dbConnection } from 'src/app.module';
import { InsertEmployeeInterface, TaskAssignInterface } from 'src/models/interface/register-employee.interface';
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

  // async createTask(formData: TaskAssignInterface, filename: string[]): Promise<ResponseInterface> {
  //   try {
   
  //     const start= new Date(formData.start_date).toISOString().slice(0, 19).replace('T', ' ');
  //     const end = new Date(formData.end_date).toISOString().slice(0, 19).replace('T', ' ');
  //     console.log(start,end);
      
  //     await dbConnection.query(
  //       `
  //       INSERT INTO task_management.task_assign_to_employee
  //       (
  //         project_name,
  //         start_date,
  //         end_date,
  //         project_status,
  //         task_name,
  //         assign_to,
  //         file_names,
  //         is_deleted
  //       ) 
  //       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  //       `,
  //       [
  //         formData.project_name,
  //         start,
  //         end,
  //         formData.project_status,
  //         formData.task_name,
  //         formData.assign_to,
  //         JSON.stringify(filename),
  //         0 
  //       ]
  //     );

  //     return {
  //       statusCode: HttpStatus.ACCEPTED,
  //       message: ResponseMessageEnum.ADD,
  //       data: true
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // } 
  async gettask(): Promise<ResponseInterface> {
    try {
      const data= await dbConnection.query(`
        SELECT * FROM task_management.task_assign_to_employee;
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
  async taskAssignToEmployee(formData: TaskAssignInterface): Promise<ResponseInterface> {
    try {
      const start = new Date(formData.start_date).toISOString().slice(0, 19).replace('T', ' ');
      const end = new Date(formData.end_date).toISOString().slice(0, 19).replace('T', ' ');
  
      // Insert the task into the tasks table
      const taskResult = await dbConnection.query(
        `
        INSERT INTO task_management.task_assign_to_employee
        (
          project_name,
          start_date,
          end_date,
          project_status,
          is_deleted
        ) 
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          formData.project_name,
          start,
          end,
          formData.project_status,
          0
        ]
      );
  
      const taskId = taskResult.insertId;
  
      // Insert task assignments
      for (const empId of formData.assignTo) {
        await dbConnection.query(
          `
          INSERT INTO task_management.task_assignments
          (
            task_id,
            empId
          ) 
          VALUES (?, ?)
          `,
          [
            taskId,
            empId
          ]
        );
      }
  
      return {
        statusCode: HttpStatus.ACCEPTED,
        message: ResponseMessageEnum.ADD,
        data: true
      };
    } catch (error) {
      throw error;
    }
  }
  
  async updateTask(taskId: number, formData: TaskAssignInterface): Promise<ResponseInterface> {
    try {
      const start = new Date(formData.start_date).toISOString().slice(0, 19).replace('T', ' ');
      const end = new Date(formData.end_date).toISOString().slice(0, 19).replace('T', ' ');
  
      // Update the task details
      await dbConnection.query(
        `
        UPDATE task_management.task_assign_to_employee
        SET
          project_name = ?,
          start_date = ?,
          end_date = ?,
          project_status = ?,
          is_deleted = ?
        WHERE task_id = ?
        `,
        [
          formData.project_name,
          start,
          end,
          formData.project_status,
          formData.is_deleted,
          taskId
        ]
      );
  
      // Remove old assignments
      await dbConnection.query(
        `
        DELETE FROM task_management.task_assignments
        WHERE task_id = ?
        `,
        [taskId]
      );
  
      // Insert new task assignments
      for (const empId of formData.assignTo) {
        await dbConnection.query(
          `
          INSERT INTO task_management.task_assignments
          (
            task_id,
            empId
          ) 
          VALUES (?, ?)
          `,
          [
            taskId,
            empId
          ]
        );
      }
  
      return {
        statusCode: HttpStatus.OK,
        message: ResponseMessageEnum.UPDATE,
        data: true
      };
    } catch (error) {
      throw error;
    }
  }
  
  async deleteTask(
    empId: number,
    employeeDetails: TaskAssignInterface
  ): Promise<ResponseInterface> {
    try {
      const employeeId=JSON.stringify(employeeDetails.assignTo);
      await dbConnection.query(`
            UPDATE task_management.task_assign_to_employee
            SET
              start_date = ${mysql.escape(employeeDetails.start_date)},
              end_date = ${mysql.escape(employeeDetails.end_date)},
              project_status = ${mysql.escape(employeeDetails.project_status)},
              is_deleted = 1,
              empId = ${mysql.escape(employeeId)},
              project_name = ${mysql.escape(employeeDetails.project_name)},
            WHERE empId = ${mysql.escape(empId)}
          `);
      return {
        statusCode: HttpStatus.OK,
        message: ResponseMessageEnum.DELETE,
        data: true
      };
    } catch (error) {
      throw error;
    }
  }
}