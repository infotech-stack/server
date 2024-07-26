import { HttpStatus, Injectable } from '@nestjs/common';
import { dbConnection } from 'src/app.module';
import { InsertEmployeeInterface, InsertMessageInterface, TaskAssignInterface, TaskReportsInterface } from 'src/models/interface/register-employee.interface';
import * as mysql from 'mysql2';
import ResponseInterface from 'src/models/interface/response.interface';
import { ResponseMessageEnum } from 'src/models/enum/response-message.enum';
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
            WHERE employee_name= ?
            AND employee_password=? AND is_deleted = ?
          `,[
          employee_name,
          employee_password,
            0 
          ]);
 
      if (data.length > 0) {
        const empId = data[0].empId;
        // const { employee_password, employee_confirmpassword, ...result } = data[0];

        const loginDateTime = new Date(); 
        const formattedLoginDateTime = loginDateTime.toISOString().slice(0, 19).replace('T', ' '); // Format to YYYY-MM-DD HH:MM:SS

        // Insert login datetime into login_and_logout table
        // await dbConnection.query(`
        //             INSERT INTO task_management.login_and_logout (login_date_time, empId)
        //             VALUES (${mysql.escape(formattedLoginDateTime)}, ${mysql.escape(empId)})
        //         `);
        const employee = data[0];

        // Fetch the role and access IDs from the role_and_access table
        const roleAccessData = await dbConnection.query(
          `SELECT role_id, access_id FROM task_management.role_and_access WHERE empId = ?`,
          [employee.empId],
        );
        const roleIds = roleAccessData.map((row: any) => row.role_id);
        const accessIds = roleAccessData.map((row: any) => row.access_id);
        let roles: string[] = [];
        if (roleIds.length > 0) {
          const roleNames = await dbConnection.query(
            `SELECT role_name FROM task_management.employee_roles WHERE role_id IN (?)`,
            [roleIds],
          );
          roles = roleNames.map((row: any) => row.role_name);
        }
    
        // Fetch access names using the access IDs
        let accesses: string[] = [];
        if (accessIds.length > 0) {
          const accessNames = await dbConnection.query(
            `SELECT access_name FROM task_management.employee_access WHERE access_id IN (?)`,
            [accessIds],
          );
          accesses = accessNames.map((row: any) => row.access_name);
        }
       const result = {
          empId: employee.empId,
          employee_name: employee.employee_name,
          employee_designation: employee.employee_designation,
          employee_cabinno: employee.employee_cabinno,
          employee_dateofjoin: employee.employee_dateofjoin,
          employee_address: employee.employee_address,
          employee_contactno: employee.employee_contactno,
          employee_email: employee.employee_email,
          employee_date_of_birth: employee.employee_date_of_birth,
          employee_religion: employee.employee_religion,
          employee_education: employee.employee_education,
          employee_experience: employee.employee_experience,
          is_deleted: employee.is_deleted,
          employee_role: roles,
          employee_access: accesses,
        };
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
  // async getEmployee(empId: number, roles: string[]): Promise<ResponseInterface> {
  //   try {
  //     let query = `
  //       SELECT * FROM task_management.employee_register e
  //       WHERE e.is_deleted = 0
  //     `;
  //     if (roles.includes('Admin') || roles.includes('Team Lead')) {
  //       query += `
  //         GROUP BY e.empId
  //       `;
  //       const employees = await dbConnection.query(query);
  //       return {
  //         statusCode: HttpStatus.OK,
  //         message: ResponseMessageEnum.GET,
  //         data: employees
  //       };
  //     } else {
  //       query += `
  //         AND e.empId = ?
  //       `;
  //       const employee = await dbConnection.query(query, [empId]);
  //       return {
  //         statusCode: HttpStatus.OK,
  //         message: ResponseMessageEnum.GET,
  //         data: employee
  //       };
  //     }
  //   } catch (error) {
  //     throw error;
  //   }

  // }
  async getEmployee(
    empId: number,
    roles: string[],
    page: number,
    limit: number
  ): Promise<ResponseInterface> {
    try {
      const offset = (page - 1) * limit;
  
      // Construct base query
      let query = `
        SELECT * FROM task_management.employee_register
        WHERE is_deleted = 0
      `;
  
      // Apply filtering based on roles
      if (!(roles.includes('Admin') || roles.includes('Team Leader'))) {
        query += ` AND empId = ${empId}`;
      }
  
      // Add pagination
      query += ` LIMIT ${limit} OFFSET ${offset}`;
  
      console.log("Executing Query:", query);
  
      // Execute query to get employees
      const employees = await dbConnection.query(query);
      console.log("Employees Result:", employees);
  
      if (employees.length === 0) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: ResponseMessageEnum.NOT_FOUND,
          data: []  
        };
      }
  
      // Counting total records
      let countQuery = `
        SELECT COUNT(*) as total
        FROM task_management.employee_register
        WHERE is_deleted = 0
      `;
  
      if (!(roles.includes('Admin') || roles.includes('Team Leader'))) {
        countQuery += ` AND empId = ${empId}`;
      }
  
      const totalResult = await dbConnection.query(countQuery);
      const totalRecords = totalResult[0].total;
  
      const results = [];
  
      for (const employee of employees) {
        // Retrieve roles
        const rolesData = await dbConnection.query(
          `
            SELECT er.role_name
            FROM task_management.employee_roles er
            INNER JOIN task_management.role_and_access raa ON er.role_id = raa.role_id
            WHERE raa.empId = ${employee.empId}
          `
        );
        console.log("Roles Data:", rolesData);
  
        // Retrieve accesses
        const accessesData = await dbConnection.query(
          `
            SELECT ea.access_name
            FROM task_management.employee_access ea
            INNER JOIN task_management.role_and_access raa ON ea.access_id = raa.access_id
            WHERE raa.empId = ${employee.empId}
          `
        );
        console.log("Accesses Data:", accessesData);
  
        // Format result to match required output
        results.push({
          empId: employee.empId,
          employee_name: employee.employee_name,
          employee_designation: employee.employee_designation,
          employee_cabinno: employee.employee_cabinno,
          employee_dateofjoin: employee.employee_dateofjoin,
          employee_address: employee.employee_address,
          employee_contactno: employee.employee_contactno,
          employee_password: employee.employee_password,
          employee_confirmpassword: employee.employee_confirmpassword,
          employee_email: employee.employee_email,
          employee_date_of_birth: employee.employee_date_of_birth,
          employee_religion: employee.employee_religion,
          employee_education: employee.employee_education,
          employee_experience: employee.employee_experience,
          employee_role: rolesData.map((role: any) => role.role_name),
          employee_access: accessesData.map((access: any) => access.access_name)
        });
      }
  
      return {
        statusCode: HttpStatus.OK,
        message: ResponseMessageEnum.GET,
        data: results,
        total: totalRecords 
      };
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
   async getAllEmployee():Promise<ResponseInterface>{
    try {
        const data=await dbConnection.query(`
        SELECT * FROM task_management.employee_register WHERE is_deleted=0;
          `);
          const results = [];
      for (const employee of data) {
        // Retrieve roles
        const rolesData = await dbConnection.query(
          `
            SELECT er.role_name
            FROM task_management.employee_roles er
            INNER JOIN task_management.role_and_access raa ON er.role_id = raa.role_id
            WHERE raa.empId = ${employee.empId}
          `
        );
        console.log("Roles Data:", rolesData);
  
        // Retrieve accesses
        const accessesData = await dbConnection.query(
          `
            SELECT ea.access_name
            FROM task_management.employee_access ea
            INNER JOIN task_management.role_and_access raa ON ea.access_id = raa.access_id
            WHERE raa.empId = ${employee.empId}
          `
        );
        console.log("Accesses Data:", accessesData);
  
        // Format result to match required output
        results.push({
          empId: employee.empId,
          employee_name: employee.employee_name,
          employee_designation: employee.employee_designation,
          employee_cabinno: employee.employee_cabinno,
          employee_dateofjoin: employee.employee_dateofjoin,
          employee_address: employee.employee_address,
          employee_contactno: employee.employee_contactno,
          employee_password: employee.employee_password,
          employee_confirmpassword: employee.employee_confirmpassword,
          employee_email: employee.employee_email,
          employee_date_of_birth: employee.employee_date_of_birth,
          employee_religion: employee.employee_religion,
          employee_education: employee.employee_education,
          employee_experience: employee.employee_experience,
          employee_role: rolesData.map((role: any) => role.role_name),
          employee_access: accessesData.map((access: any) => access.access_name)
        });
      }
  
          return{
            statusCode:HttpStatus.OK,
            message:ResponseMessageEnum.GET,
            data:results,
          }
    } catch (error) {
      throw error;
    }
   }
  // async getEmployee(empId: number, roles: string[], search: string, sortField: string, sortOrder: string, page: number, limit: number): Promise<ResponseInterface> {
  //   try {
  //     const offset = (page - 1) * limit;
  
  //     let query = `
  //       SELECT * FROM task_management.employee_register e
  //       WHERE e.is_deleted = 0
  //     `;
  
  //     // Search functionality
  //     if (search) {
  //       query += ` AND (e.employee_name LIKE ? OR e.email LIKE ? OR e.mobileno LIKE ?)`;
  //     }
  
  //     // Sort functionality
  //     if (sortField && sortOrder) {
  //       query += ` ORDER BY ${sortField} ${sortOrder}`;
  //     }
  
  //     // Pagination
  //     query += ` LIMIT ? OFFSET ?`;
  
  //     const queryParams: any[] = [];
  //     if (search) {
  //       queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
  //     }
  //     queryParams.push(limit, offset);
  
  //     let employees;
  //     if (roles.includes('Admin') || roles.includes('Team Lead')) {
  //       employees = await dbConnection.query(query, queryParams);
  //     } else {
  //       query += ` AND e.empId = ?`;
  //       queryParams.push(empId);
  //       employees = await dbConnection.query(query, queryParams);
  //     }
  
  //     return {
  //       statusCode: HttpStatus.OK,
  //       message: ResponseMessageEnum.GET,
  //       data: employees
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // }
  
  // async registerEmployee(employeeDetails: InsertEmployeeInterface): Promise<ResponseInterface> {
  //   try {
  //     const employeeRole = JSON.stringify(employeeDetails.employee_role);
  //     const employeeAccess = JSON.stringify(employeeDetails.employee_access);
  //     console.log(employeeDetails);

  //     const employeeDateOfJoin = new Date(employeeDetails.employee_dateofjoin).toISOString().slice(0, 19).replace('T', ' ');
  //     const employeeDateOfBirth = employeeDetails.employee_date_of_birth ? new Date(employeeDetails.employee_date_of_birth).toISOString().slice(0, 19).replace('T', ' ') : null;

  //     console.log(employeeDateOfJoin);
  //     console.log(employeeDateOfBirth);

  //     await dbConnection.query(`
  //       INSERT INTO task_management.employee_register
  //       (
  //         employee_name,
  //         employee_designation,
  //         employee_cabinno,
  //         employee_dateofjoin,
  //         employee_address,
  //         employee_contactno,
  //         employee_password,
  //         employee_confirmpassword,
  //         employee_role,
  //         employee_access,
  //         employee_email,
  //         employee_date_of_birth,
  //         employee_religion,
  //         employee_education,
  //         employee_experience,
  //         is_deleted
  //       )
  //       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
  //     `, [
  //       employeeDetails.employee_name,
  //       employeeDetails.employee_designation,
  //       employeeDetails.employee_cabinno,
  //       employeeDateOfJoin,
  //       employeeDetails.employee_address,
  //       employeeDetails.employee_contactno,
  //       employeeDetails.employee_password,
  //       employeeDetails.employee_confirmpassword,
  //       employeeRole,
  //       employeeAccess,
  //       employeeDetails.employee_email,
  //       employeeDateOfBirth,
  //       employeeDetails.employee_religion,
  //       employeeDetails.employee_education,
  //       employeeDetails.employee_experience,
  //       0
  //     ]);

  //     return {
  //       statusCode: HttpStatus.ACCEPTED,
  //       message: ResponseMessageEnum.ADD,
  //       data: true
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // }
  async registerEmployee(employeeDetails: InsertEmployeeInterface): Promise<ResponseInterface> {
    try {
      console.log(employeeDetails);
  
      const employeeDateOfJoin = new Date(employeeDetails.employee_dateofjoin).toISOString().slice(0, 19).replace('T', ' ');
      const employeeDateOfBirth = employeeDetails.employee_date_of_birth ? new Date(employeeDetails.employee_date_of_birth).toISOString().slice(0, 19).replace('T', ' ') : null;
      const employeeResult = await dbConnection.query(
        `
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
            employee_email,
            employee_date_of_birth,
            employee_religion,
            employee_education,
            employee_experience,
            is_deleted
          ) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        `,
        [
          employeeDetails.employee_name,
          employeeDetails.employee_designation,
          employeeDetails.employee_cabinno,
          employeeDateOfJoin,
          employeeDetails.employee_address,
          employeeDetails.employee_contactno,
          employeeDetails.employee_password,
          employeeDetails.employee_confirmpassword,
          employeeDetails.employee_email,
          employeeDateOfBirth,
          employeeDetails.employee_religion,
          employeeDetails.employee_education,
          employeeDetails.employee_experience
        ]
      );
  
      const empId = employeeResult.insertId;
  
      // Insert roles into role_and_access
      for (const roleId of employeeDetails.employee_role) {
        await dbConnection.query(
          `
            INSERT INTO task_management.role_and_access
            (
              empId,
              role_id
            ) 
            VALUES (?, ?)
          `,
          [empId, roleId]
        );
      }
  
      // Insert access into role_and_access
      for (const accessId of employeeDetails.employee_access) {
        await dbConnection.query(
          `
            INSERT INTO task_management.role_and_access
            (
              empId,
              access_id
            ) 
            VALUES (?, ?)
          `,
          [empId, accessId]
        );
      }
  
      return {
        statusCode: HttpStatus.CREATED,
        message: ResponseMessageEnum.ADD,
        data: true
      };
    } catch (error) {
      // console.error("Error:", error);
      throw error;
    }
  }
  
  // async updateEmployee(
  //   empId: number,
  //   employeeDetails: InsertEmployeeInterface
  // ): Promise<ResponseInterface> {
  //   try {
  //     await dbConnection.query(`
  //           UPDATE task_management.employee_register 
  //           SET
  //             employee_name = ${mysql.escape(employeeDetails.employee_name)},
  //             employee_designation = ${mysql.escape(employeeDetails.employee_designation)},
  //             employee_cabinno = ${mysql.escape(employeeDetails.employee_cabinno)},
  //             employee_dateofjoin = ${mysql.escape(employeeDetails.employee_dateofjoin)},
  //             employee_address = ${mysql.escape(employeeDetails.employee_address)},
  //             employee_contactno = ${mysql.escape(employeeDetails.employee_contactno)},
  //             employee_password = ${mysql.escape(employeeDetails.employee_password)},
  //             employee_confirmpassword = ${mysql.escape(employeeDetails.employee_confirmpassword)},
  //             employee_role = ${mysql.escape(JSON.stringify(employeeDetails.employee_role))}, 
  //             employee_access = ${mysql.escape(JSON.stringify(employeeDetails.employee_access))},
  //             employee_email=${mysql.escape(employeeDetails.employee_email)},
  //             employee_date_of_birth=${mysql.escape(employeeDetails.employee_date_of_birth)},
  //             employee_religion=${mysql.escape(employeeDetails.employee_religion)},
  //             employee_education=${mysql.escape(employeeDetails.employee_education)},
  //             employee_experience=${mysql.escape(employeeDetails.employee_experience)},
  //             is_deleted=0
  //           WHERE empId = ${mysql.escape(empId)}
  //         `);
  //     return {
  //       statusCode: HttpStatus.ACCEPTED,
  //       message: ResponseMessageEnum.UPDATE,
  //       data: true
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // }
  async updateEmployee(empId: number, employeeDetails: InsertEmployeeInterface): Promise<ResponseInterface> {
    try {
      console.log(employeeDetails);
  
      const employeeDateOfJoin = new Date(employeeDetails.employee_dateofjoin).toISOString().slice(0, 19).replace('T', ' ');
      const employeeDateOfBirth = employeeDetails.employee_date_of_birth ? new Date(employeeDetails.employee_date_of_birth).toISOString().slice(0, 19).replace('T', ' ') : null;
  
      // Update employee details
      await dbConnection.query(
        `
          UPDATE task_management.employee_register
          SET
            employee_name = ?,
            employee_designation = ?,
            employee_cabinno = ?,
            employee_dateofjoin = ?,
            employee_address = ?,
            employee_contactno = ?,
            employee_password = ?,
            employee_confirmpassword = ?,
            employee_email = ?,
            employee_date_of_birth = ?,
            employee_religion = ?,
            employee_education = ?,
            employee_experience = ?
            WHERE empId = ?
        `,
        [
          employeeDetails.employee_name,
          employeeDetails.employee_designation,
          employeeDetails.employee_cabinno,
          employeeDateOfJoin,
          employeeDetails.employee_address,
          employeeDetails.employee_contactno,
          employeeDetails.employee_password,
          employeeDetails.employee_confirmpassword,
          employeeDetails.employee_email,
          employeeDateOfBirth,
          employeeDetails.employee_religion,
          employeeDetails.employee_education,
          employeeDetails.employee_experience,
          empId
        ]
      );
  
      // Clear existing roles and access
      await dbConnection.query(
        `
          DELETE FROM task_management.role_and_access
          WHERE empId = ?
        `,
        [empId]
      );
  
      // Insert updated roles into role_and_access
      for (const roleId of employeeDetails.employee_role) {
        await dbConnection.query(
          `
            INSERT INTO task_management.role_and_access
            (
              empId,
              role_id
            ) 
            VALUES (?, ?)
          `,
          [empId, roleId]
        );
      }
  
      // Insert updated access into role_and_access
      for (const accessId of employeeDetails.employee_access) {
        await dbConnection.query(
          `
            INSERT INTO task_management.role_and_access
            (
              empId,
              access_id
            ) 
            VALUES (?, ?)
          `,
          [empId, accessId]
        );
      }
  
      return {
        statusCode: HttpStatus.OK,
        message: ResponseMessageEnum.UPDATE,
        data: true
      };
    } catch (error) {
      // console.error("Error:", error);
      throw error;
    }
  }
  
  async removeEmployee(
    empId: number,
  ): Promise<ResponseInterface> {
    try {
      await dbConnection.query(`
        UPDATE task_management.employee_register 
        SET is_deleted = 1
        WHERE empId = ?
      `, [empId]);
     
      return {
        statusCode: HttpStatus.ACCEPTED,
        message: ResponseMessageEnum.DELETE,
        data: true
      };
    } catch (error) {
      throw error;
    }
  }
  async getEmployeeAccess():Promise<ResponseInterface>{
    try {
      const data=await dbConnection.query(`
    SELECT * FROM task_management.employee_access;
        
        `);
        return{
          statusCode:HttpStatus.OK,
          message:ResponseMessageEnum.GET,
          data:data
        }
    } catch (error) {
      throw error;
    }
  }
  async getEmployeeRole():Promise<ResponseInterface>{
    try {
      const data=await dbConnection.query(`
        SELECT * FROM task_management.employee_roles;
        
        `);
        return{
          statusCode:HttpStatus.OK,
          message:ResponseMessageEnum.GET,
          data:data
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
  async employeeFilter(): Promise<ResponseInterface> {
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
  // async getTasksByRole(empId: number, roles: string[]): Promise<ResponseInterface> {
  //   try {
  //     // Base query
  //     let query = `
  //       SELECT
  //         e.empId,
  //         e.employee_name,
  //         JSON_ARRAYAGG(
  //           JSON_OBJECT(
  //             'task_id', t.task_id,
  //             'start_date', DATE_FORMAT(t.start_date,'%Y-%m-%d %H:%i:%s'),
  //             'end_date', DATE_FORMAT(t.end_date,'%Y-%m-%d %H:%i:%s'),
  //             'project_status',a.project_status,
  //             'is_deleted', t.is_deleted,
  //             'project_name', t.project_name
  //           )
  //         ) AS taskDetails
  //       FROM
  //         task_management.task_assign_to_employee t
  //       JOIN
  //         task_management.task_assignments a ON t.task_id = a.task_id
  //       JOIN
  //         task_management.employee_register e ON a.empId = e.empId
  //       WHERE
  //         t.is_deleted = 0
  //     `;

  //     // Check for "Admin" or "Team Lead" roles
  //     if (roles.includes('Admin') || roles.includes('Team Lead')) {
  //       query += `
  //         GROUP BY e.empId
  //       `;
  //     } else {
  //       query += `
  //         AND e.empId = ?
  //         GROUP BY e.empId
  //       `;
  //     }

  //     // Execute query
  //     const tasks = roles.includes('Admin') || roles.includes('Team Lead')
  //       ? await dbConnection.query(query)
  //       : await dbConnection.query(query, [empId]);

  //     return {
  //       statusCode: HttpStatus.OK,
  //       message: ResponseMessageEnum.GET,
  //       data: tasks
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // }
  async getTasksByRole(
    empId: number,
    roles: string[],
    page: number,
    limit: number,
    sortField: string = 'employee_name',
    sortOrder: string = 'ASC'
  ): Promise<ResponseInterface> {
    try {
      const offset = (page - 1) * limit; // Adjust offset calculation
      let query = `
        SELECT
          e.empId,
          e.employee_name,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'task_id', t.task_id,
              'start_date', DATE_FORMAT(t.start_date,'%Y-%m-%d %H:%i:%s'),
              'end_date', DATE_FORMAT(t.end_date,'%Y-%m-%d %H:%i:%s'),
              'project_status', a.project_status,
              'is_deleted', t.is_deleted,
              'project_name', t.project_name
            )
          ) AS taskDetails
        FROM
          task_management.task_assign_to_employee t
        JOIN
          task_management.task_assignments a ON t.task_id = a.task_id
        JOIN
          task_management.employee_register e ON a.empId = e.empId
        WHERE
          t.is_deleted = 0
      `;
  
      if (roles.includes('Admin') || roles.includes('Team leader')) {
        query += ` GROUP BY e.empId`;
      } else {
        query += ` AND e.empId = ? GROUP BY e.empId`;
      }
  
      // Add sorting
      const validSortFields = ['employee_name', 'project_name', 'start_date', 'end_date', 'project_status'];
      if (validSortFields.includes(sortField) && (sortOrder === 'ASC' || sortOrder === 'DESC')) {
        query += ` ORDER BY ${sortField} ${sortOrder}`;
      }
  
      // Add pagination
      if (limit !== -1) {
        query += ` LIMIT ${limit} OFFSET ${offset}`;
      }
  
      // Counting total records
      let countQuery = `
        SELECT COUNT(*) as total
        FROM task_management.task_assign_to_employee t
        JOIN task_management.task_assignments a ON t.task_id = a.task_id
        JOIN task_management.employee_register e ON a.empId = e.empId
        WHERE t.is_deleted = 0
      `;
  
      if (!roles.includes('Admin') && !roles.includes('Team Leader')) {
        countQuery += ` AND e.empId = ?`;
      }
  
      const totalTasks = roles.includes('Admin') || roles.includes('Team Leader')
        ? await dbConnection.query(countQuery)
        : await dbConnection.query(countQuery, [empId]);
  
      // Fetching paginated results
      const tasks = roles.includes('Admin') || roles.includes('Team Leader')
        ? await dbConnection.query(query)
        : await dbConnection.query(query, [empId]);
  
      return {
        statusCode: HttpStatus.OK,
        message: ResponseMessageEnum.GET,
        data: tasks,
        total: totalTasks[0].total,
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
            empId,
            project_status
          ) 
          VALUES (?, ?, ?)
          `,
          [
            taskId,
            empId,
            formData.project_status
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
  async updateTask(taskId: number, empId: number, formData: TaskAssignInterface): Promise<ResponseInterface> {
    try {
      const start = new Date(formData.start_date).toISOString().slice(0, 19).replace('T', ' ');
      const end = new Date(formData.end_date).toISOString().slice(0, 19).replace('T', ' ');

      if (empId) {
        try {
          // Update task details
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
              0,
              taskId
            ]
          );

          // Remove old assignments
          await dbConnection.query(
            `
            DELETE FROM task_management.task_assignments
            WHERE task_id = ? AND empId = ?
            `,
            [taskId,empId]
          );

          // Insert new task assignments
          for (const empId of formData.assignTo) {
            await dbConnection.query(
              `
              INSERT INTO task_management.task_assignments
              (
                task_id,
                empId,
                project_status

              ) 
              VALUES (?, ?, ?)
              `,
              [
                taskId,
                empId,
                formData.project_status

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
        } finally {

        }
      }
    } catch (error) {
      throw error;
    }
  }
  async deleteTask(taskId: number, empId: number): Promise<ResponseInterface> {
    try {
      // Mark the task as deleted
      await dbConnection.query(
        `
        UPDATE task_management.task_assign_to_employee
        SET is_deleted = 1
        WHERE task_id = ?
        `,
        [taskId]
      );

      // Delete the specific assignment
      await dbConnection.query(
        `
        DELETE FROM task_management.task_assignments
        WHERE task_id = ? AND empId = ?
        `,
        [taskId, empId]
      );


      return {
        statusCode: HttpStatus.OK,
        message: ResponseMessageEnum.DELETE,
        data: true
      };
    } catch (error) {

      throw error;
    } finally {

    }
  }
  //EMPLOYEE SEARCH
  async searchEmployeeById(empId: number): Promise<ResponseInterface> {
    try {
      const employeeQuery = `
        SELECT *
        FROM task_management.employee_register
        WHERE empId = ${mysql.escape(empId)} AND is_deleted = 0;
      `;
  
      const taskQuery = `
        SELECT
          t.task_id,
          DATE_FORMAT(t.start_date, '%Y-%m-%d %H:%i:%s') AS start_date,
          DATE_FORMAT(t.end_date, '%Y-%m-%d %H:%i:%s') AS end_date,
          t.project_status,
          t.is_deleted,
          t.project_name
        FROM
          task_management.task_assign_to_employee t
        JOIN
          task_management.task_assignments a ON t.task_id = a.task_id
        WHERE
          a.empId = ${mysql.escape(empId)} AND t.is_deleted = 0;
      `;
  
      // Execute both queries concurrently
      const [employeeData, taskData] = await Promise.all([
        dbConnection.query(employeeQuery),
        dbConnection.query(taskQuery)
      ]);
  
      // Check if employee data is retrieved
      if (employeeData.length === 0) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: ResponseMessageEnum.NOT_FOUND,
          data: []
        };
      }
  
      // Extract employee details from the result
      const employee = employeeData[0];
  
      // Retrieve roles and accesses
      const roleAccessData = await dbConnection.query(
        `SELECT role_id, access_id FROM task_management.role_and_access WHERE empId = ${mysql.escape(employee.empId)}`
      );
  
      const roleIds = roleAccessData.map((row: any) => row.role_id);
      const accessIds = roleAccessData.map((row: any) => row.access_id);
  
      // Fetch role names using the role IDs
      let roles: string[] = [];
      if (roleIds.length > 0) {
        const roleNames = await dbConnection.query(
          `SELECT role_name FROM task_management.employee_roles WHERE role_id IN (${roleIds.map(id => mysql.escape(id)).join(",")})`
        );
        roles = roleNames.map((row: any) => row.role_name);
      }
  
      // Fetch access names using the access IDs
      let accesses: string[] = [];
      if (accessIds.length > 0) {
        const accessNames = await dbConnection.query(
          `SELECT access_name FROM task_management.employee_access WHERE access_id IN (${accessIds.map(id => mysql.escape(id)).join(",")})`
        );
        accesses = accessNames.map((row: any) => row.access_name);
      }
  
      // Format taskDetails if taskData has results
      const taskDetails = taskData.map(task => ({
        task_id: task.task_id,
        start_date: task.start_date,
        end_date: task.end_date,
        project_status: task.project_status,
        is_deleted: task.is_deleted,
        project_name: task.project_name
      }));
  
      // Combine employee details with roles, accesses, and taskDetails
      const responseData = [{
        empId: employee.empId,
        employee_name: employee.employee_name,
        employee_designation: employee.employee_designation,
        employee_cabinno: employee.employee_cabinno,
        employee_dateofjoin: employee.employee_dateofjoin,
        employee_address: employee.employee_address,
        employee_contactno: employee.employee_contactno,
        employee_password: employee.employee_password,
        employee_confirmpassword: employee.employee_confirmpassword,
        employee_email: employee.employee_email,
        employee_date_of_birth: employee.employee_date_of_birth,
        employee_religion: employee.employee_religion,
        employee_education: employee.employee_education,
        employee_experience: employee.employee_experience,
        employee_role: roles,
        employee_access: accesses,
        taskDetails: taskDetails || []
      }];
  
      return {
        statusCode: HttpStatus.OK,
        message: ResponseMessageEnum.GET,
        data: responseData
      };
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
  
  
  //TASK REPORTS
  async taskReports(empId: number, taskId: number, newStatus: TaskReportsInterface): Promise<ResponseInterface> { 
    try {
      console.log(newStatus,taskId,empId);
      
      // Update the project_status for the specific task assigned to the employee
      await dbConnection.query(
        `
        UPDATE task_management.task_assign_to_employee AS tae
        INNER JOIN task_management.task_assignments AS ta
        ON tae.task_id = ta.task_id
        SET ta.project_status = ?
        WHERE ta.task_id = ? AND ta.empId = ?
        `,
        [newStatus.project_status, taskId, empId]
      );

      return {
        statusCode: HttpStatus.OK,
        message: ResponseMessageEnum.UPDATE,
        data: true
      };
    } catch (error) {
      throw error;
    }
  }
  //MESSAGE
  async postMessage(message: InsertMessageInterface):Promise<ResponseInterface> {
    try {
      console.log(message, 'service');

      const files = JSON.stringify(message.filename);
      await dbConnection.query(`
        INSERT INTO task_management.message
        (
          message_description,
          filename,
          is_deleted,
          empId,
          send_by
        )
        VALUES (?, ?, ?, ?, ?)`,
        [
          message.message_description,
          files,
          0,
          message.empId,
          message.send_by
        ]);
      return {
        statusCode: HttpStatus.OK,
        message: ResponseMessageEnum.ADD,
        data: true
      }
    } catch (error) {
      throw error;
    }
  }
  async getMessage(empId: number): Promise<ResponseInterface> {
    try {
      const data = await dbConnection.query(`
        SELECT 
          e.employee_name AS receiver_name, 
          e.empId AS receiver_empId, 
          s.employee_name AS sender_name,
          m.*
        FROM 
          task_management.employee_register e
        JOIN 
          task_management.message m ON e.empId = m.empId
        JOIN 
          task_management.employee_register s ON m.send_by = s.empId
        WHERE 
          e.empId = ?
        ORDER BY 
          m.message_id DESC
        LIMIT 1;
      `, [empId]);
  
      return {
        statusCode: HttpStatus.OK,
        message: ResponseMessageEnum.GET,
        data: data
      };
    } catch (error) {
      throw error;
    }
  }
  
}