import { HttpStatus, Injectable } from '@nestjs/common';
import { dbConnection } from 'src/app.module';
import { InsertEmployeeInterface, ResetPasswordInterface, TaskAssignInterface, TaskReportsInterface, TaskWithMessageInterface } from 'src/models/interface/register-employee.interface';
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
          `, [
        employee_name,
        employee_password,
        0
      ]);

      if (data.length > 0) {
        const empId = data[0].empId;
        // const { employee_password, employee_confirmpassword, ...result } = data[0];

        const loginDateTime = new Date();
        const formattedLoginDateTime = loginDateTime.toISOString().slice(0, 19).replace('T', ' '); // Format to YYYY-MM-DD HH:MM:SS

        await dbConnection.query(`
                    INSERT INTO task_management.login_and_logout (login_date_time, empId)
                    VALUES (${mysql.escape(formattedLoginDateTime)}, ${mysql.escape(empId)})
                `);
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
  //EMPLOYEE
  async getEmployee(
    empId: number,
    roles: string[],
    page: number,
    limit: number
  ): Promise<ResponseInterface> {
    try {
      const offset = (page - 1) * limit;

      // Construct base query with conditional subqueries
      let query = `
      SELECT 
        e.empId,
        e.employee_name,
        e.employee_designation,
        e.employee_cabinno,
        e.employee_dateofjoin,
        e.employee_address,
        e.employee_contactno,
        e.employee_password,
        e.employee_confirmpassword,
        e.employee_email,
        e.employee_date_of_birth,
        e.employee_religion,
        e.employee_education,
        e.employee_experience,
        -- Subquery to get roles
        (
          SELECT GROUP_CONCAT(DISTINCT er.role_name SEPARATOR ', ')
          FROM task_management.role_and_access raa
          INNER JOIN task_management.employee_roles er ON raa.role_id = er.role_id
          WHERE raa.empId = e.empId
        ) AS employee_role,
        -- Subquery to get accesses
        (
          SELECT GROUP_CONCAT(DISTINCT ea.access_name SEPARATOR ', ')
          FROM task_management.role_and_access raa
          INNER JOIN task_management.employee_access ea ON raa.access_id = ea.access_id
          WHERE raa.empId = e.empId
        ) AS employee_access
      FROM 
        task_management.employee_register e
      WHERE 
        e.is_deleted = 0
        ${!(roles.includes('Admin') || roles.includes('Team Leader')) ? `AND e.empId = ${empId}` : ''}
      LIMIT ${offset}, ${limit}
    `;
  

      // Execute query to get employees
      const employees = await dbConnection.query(query);
   

      if (employees.length === 0) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: ResponseMessageEnum.NOT_FOUND,
          data: []
        };
      }

      // Counting total records
      let countQuery = `
      SELECT COUNT(*) AS total
      FROM task_management.employee_register e
      WHERE 
        e.is_deleted = 0
        ${!(roles.includes('Admin') || roles.includes('Team Leader')) ? `AND e.empId = ${empId}` : ''}
    `;
      const totalResult = await dbConnection.query(countQuery);
      const totalRecords = totalResult[0].total;

      // Format result to match required output
      const results = employees.map((employee: any) => ({
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
        employee_role: employee.employee_role ? employee.employee_role.split(', ') : [],
        employee_access: employee.employee_access ? employee.employee_access.split(', ') : []
      }));

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
  async getAllEmployee(): Promise<ResponseInterface> {
    try {
      // Construct the query with joins and aggregations
      const query = `
      SELECT 
        e.empId,
        e.employee_name,
        e.employee_gender,
        e.employee_designation,
        e.employee_cabinno,
        e.employee_dateofjoin,
        e.employee_address,
        e.employee_contactno,
        e.employee_password,
        e.employee_confirmpassword,
        e.employee_email,
        e.employee_date_of_birth,
        e.employee_religion,
        e.employee_education,
        e.employee_experience,
        -- Subquery to get roles
        (
          SELECT GROUP_CONCAT(DISTINCT er.role_name SEPARATOR ', ')
          FROM task_management.role_and_access raa
          INNER JOIN task_management.employee_roles er ON raa.role_id = er.role_id
          WHERE raa.empId = e.empId
        ) AS employee_role,
        -- Subquery to get accesses
        (
          SELECT GROUP_CONCAT(DISTINCT ea.access_name SEPARATOR ', ')
          FROM task_management.role_and_access raa
          INNER JOIN task_management.employee_access ea ON raa.access_id = ea.access_id
          WHERE raa.empId = e.empId
        ) AS employee_access
      FROM 
        task_management.employee_register e
      WHERE 
        e.is_deleted = 0
    `;


      // Execute the query to get employees
      const employees = await dbConnection.query(query);


      if (employees.length === 0) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: ResponseMessageEnum.NOT_FOUND,
          data: []
        };
      }

      // Format result to match required output
      const results = employees.map((employee: any) => ({
        empId: employee.empId,
        employee_name: employee.employee_name,
        employee_gender: employee.employee_gender,
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
        employee_role: employee.employee_role ? employee.employee_role.split(', ') : [],
        employee_access: employee.employee_access ? employee.employee_access.split(', ') : []
      }));

      return {
        statusCode: HttpStatus.OK,
        message: ResponseMessageEnum.GET,
        data: results,
      };
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
  async employeeForMessage(userRoles: string[]): Promise<ResponseInterface> {
    try {
      // Check if user roles array includes "Admin"
      const isAdmin = userRoles.includes('Admin');

      // Base query to get employee data
      let query = `
        SELECT er.*, GROUP_CONCAT(DISTINCT erole.role_name) AS roles, GROUP_CONCAT(DISTINCT eaccess.access_name) AS accesses
        FROM task_management.employee_register er
        LEFT JOIN task_management.role_and_access raa ON er.empId = raa.empId
        LEFT JOIN task_management.employee_roles erole ON raa.role_id = erole.role_id
        LEFT JOIN task_management.employee_access eaccess ON raa.access_id = eaccess.access_id
        WHERE er.is_deleted = 0
      `;

      // If user is not admin, modify the query to fetch only admin data
      if (!isAdmin) {
        query += ` AND raa.role_id IN (SELECT role_id FROM task_management.employee_roles WHERE role_name = 'Admin')`;
      }

      query += `
        GROUP BY er.empId
      `;

      const data = await dbConnection.query(query);
      const results = data.map((employee: any) => ({
        empId: employee.empId,
        employee_name: employee.employee_name,
        employee_gender: employee.employee_gender,
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
        employee_role: employee.roles ? employee.roles.split(',') : [],
        employee_access: employee.accesses ? employee.accesses.split(',') : []
      }));

      return {
        statusCode: HttpStatus.OK,
        message: ResponseMessageEnum.GET,
        data: results,
      };
    } catch (error) {
      throw error;
    }
  }
  async registerEmployee(employeeDetails: InsertEmployeeInterface): Promise<ResponseInterface> {
    try {


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
            is_deleted,
            employee_gender
          ) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0,?)
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
          employeeDetails.employee_gender
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
  async updateEmployee(empId: number, employeeDetails: InsertEmployeeInterface): Promise<ResponseInterface> {
    try {
  

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
            employee_experience = ?,
            employee_gender = ?
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
          employeeDetails.employee_gender,
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
  async getEmployeeAccess(): Promise<ResponseInterface> {
    try {
      const data = await dbConnection.query(`
    SELECT * FROM task_management.employee_access;
        
        `);
      return {
        statusCode: HttpStatus.OK,
        message: ResponseMessageEnum.GET,
        data: data
      }
    } catch (error) {
      throw error;
    }
  }
  async getEmployeeRole(): Promise<ResponseInterface> {
    try {
      const data = await dbConnection.query(`
        SELECT * FROM task_management.employee_roles;
        
        `);
      return {
        statusCode: HttpStatus.OK,
        message: ResponseMessageEnum.GET,
        data: data
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
    er.employee_cabinno AS employee_cabinno,
    DATE_FORMAT(ll.login_date_time, '%Y-%m-%d %H:%i:%s') AS login_date_time,
    DATE_FORMAT(ll.logout_date_time, '%Y-%m-%d %H:%i:%s') AS logout_date_time
FROM 
    task_management.employee_register er
JOIN 
    task_management.login_and_logout ll ON er.empId = ll.empId;

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
  async employeeFilter(empId: number, login_date_from: Date, login_date_to: Date): Promise<ResponseInterface> {
    try {
      // Format the dates to match the database format
      const formattedLoginDateFrom = new Date(login_date_from).toISOString().slice(0, 19).replace('T', ' ');
      const formattedLoginDateTo = new Date(login_date_to).toISOString().slice(0, 19).replace('T', ' ');

      // Adjust the SQL query to include the employee_name and date range conditions
      const data = await dbConnection.query(`
        SELECT 
          er.*,
          DATE_FORMAT(ll.login_date_time, '%Y-%m-%d %H:%i:%s') AS login_date_time,
          DATE_FORMAT(ll.logout_date_time, '%Y-%m-%d %H:%i:%s') AS logout_date_time
        FROM 
          task_management.employee_register er
        JOIN 
          task_management.login_and_logout ll ON er.empId = ll.empId
        WHERE 
          ll.empId = ? AND ll.login_date_time BETWEEN ? AND ?
      `, [empId, formattedLoginDateFrom, formattedLoginDateTo]);

      const results = [];
      for (const employee of data) {
        // Retrieve roles
        const rolesData = await dbConnection.query(`
          SELECT er.role_name
          FROM task_management.employee_roles er
          INNER JOIN task_management.role_and_access raa ON er.role_id = raa.role_id
          WHERE raa.empId = ?
        `, [employee.empId]);

   

        // Retrieve accesses
        const accessesData = await dbConnection.query(`
          SELECT ea.access_name
          FROM task_management.employee_access ea
          INNER JOIN task_management.role_and_access raa ON ea.access_id = raa.access_id
          WHERE raa.empId = ?
        `, [employee.empId]);

    

        // Format result to match required output including login_date_time and logout_date_time
        results.push({
          empId: employee.empId,
          employee_name: employee.employee_name,
          employee_gender: employee.employee_gender,
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
          login_date_time: employee.login_date_time,
          logout_date_time: employee.logout_date_time,
          employee_role: rolesData.map((role: any) => role.role_name),
          employee_access: accessesData.map((access: any) => access.access_name)
        });
      }

      return {
        statusCode: HttpStatus.OK,
        message: ResponseMessageEnum.GET,
        data: results
      };
    } catch (error) {
      throw error;
    }
  }
  //TASK ASSIGN
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
  async deleteTask(taskId: number, empId: number, message_id: number): Promise<ResponseInterface> {
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

      await dbConnection.query(
        `
        UPDATE task_management.message
        SET is_deleted = 1
        WHERE task_id = ? AND empId = ? AND message_id =?
        `,
        [taskId, empId, message_id]
      );
      return {
        statusCode: HttpStatus.OK,
        message: ResponseMessageEnum.DELETE,
        data: true
      };
    } catch (error) {

      throw error;
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
        employee_gender: employee.employee_gender,
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
  async postMessage(message: TaskWithMessageInterface): Promise<ResponseInterface> {
    try {
  
      var start = new Date(message.start_date).toISOString().slice(0, 19).replace('T', ' ');
      var end = new Date(message.end_date).toISOString().slice(0, 19).replace('T', ' ');
      var filename = JSON.stringify(message.filename);
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
          message.project_name,
          start,
          end,
          message.project_status,
          0
        ]
      );

      const taskId = taskResult.insertId;

      // Insert task assignments
      for (const empId of message.empId) {
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
            message.project_status
          ]
        );
      }
      for (const empId of message.empId) {
        await dbConnection.query(
          `
          INSERT INTO task_management.message
          (
            message_description,
            filename,
            is_deleted,
            empId,
            send_by,
            task_id
          ) 
          VALUES (?, ?, ?,?,?,?)
          `,
          [
            message.message_description,
            filename,
            0,
            empId,
            message.send_by,
            taskId
          ]
        );
      }

      return {
        statusCode: HttpStatus.OK,
        message: ResponseMessageEnum.ADD,
        data: true
      }
    } catch (error) {
      throw error;
    }
  }
  async updateTask(taskId: number, selected_empid: number, message_id: number, formData: TaskWithMessageInterface): Promise<ResponseInterface> {
    try {

      const start = new Date(formData.start_date).toISOString().slice(0, 19).replace('T', ' ');
      const end = new Date(formData.end_date).toISOString().slice(0, 19).replace('T', ' ');
      var filename = JSON.stringify(formData.filename);


      if (selected_empid) {
        try {
          let employeeIds: number[] = [];
          for (let index = 0; index < formData.empId.length; index++) {
            const id = await dbConnection.query(`
            SELECT empId FROM task_management.employee_register 
            WHERE employee_name = ?
          `, [formData.empId[index]]);

            if (id.length > 0) {
              employeeIds.push(id[0].empId);
            }
          }
        


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
            [taskId, selected_empid]
          );
          await dbConnection.query(
            `
            DELETE FROM task_management.message
            WHERE task_id = ? AND empId = ? AND message_id =?
            `,
            [taskId, selected_empid, message_id]
          );


          // Insert new task assignments
          for (const newempId of formData.empId) {
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
                newempId,
                formData.project_status

              ]
            );
          }
          for (const empId of formData.empId) {
            await dbConnection.query(
              `
              INSERT INTO task_management.message
              (
                message_description,
                filename,
                is_deleted,
                empId,
                send_by,
                task_id
              ) 
              VALUES (?, ?, ?,?,?,?)
              `,
              [
                formData.message_description,
                filename,
                0,
                empId,
                formData.send_by,
                taskId
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
  async getTasksByRole(
    empId: number,
    roles: string[],
    page: number,
    limit: number,
    sortField: string = 'employee_name',
    sortOrder: string = 'ASC'
  ): Promise<ResponseInterface> {
    try {
      const offset = (page - 1) * limit;

      let baseQuery = `
      SELECT
        e.empId,
        e.employee_name,
        t.task_id,
        DATE_FORMAT(t.start_date, '%Y-%m-%d %H:%i:%s') AS start_date,
        DATE_FORMAT(t.end_date, '%Y-%m-%d %H:%i:%s') AS end_date,
        a.project_status,
        t.is_deleted,
        t.project_name,
        m.send_by,
        m.filename,
        m.is_deleted AS message_is_deleted,
        m.message_id,
        sender.employee_name AS send_by_name,
        receiver.employee_name AS send_to_name,
        m.message_description
      FROM
        task_management.task_assign_to_employee t
      JOIN
        task_management.task_assignments a ON t.task_id = a.task_id
      JOIN
        task_management.employee_register e ON a.empId = e.empId
      LEFT JOIN
        task_management.message m ON t.task_id = m.task_id AND m.is_deleted = 0
      LEFT JOIN
        task_management.employee_register sender ON m.send_by = sender.empId
      LEFT JOIN
        task_management.employee_register receiver ON m.empId = receiver.empId
      WHERE
        t.is_deleted = 0
    `;

      if (!roles.includes('Admin') && !roles.includes('Team Leader')) {
        baseQuery += ` AND e.empId = ?`;
      }

      let filteredQuery = `
      SELECT
        empId,
        employee_name,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'task_id', task_id,
            'start_date', start_date,
            'end_date', end_date,
            'project_status', project_status,
            'is_deleted', is_deleted,
            'project_name', project_name,
            'send_by', send_by,
            'filename', filename,
            'message_is_deleted', message_is_deleted,
            'message_id', message_id,
            'send_by_name', send_by_name,
            'send_to_name', send_to_name,
            'message_description', message_description
          )
        ) AS taskDetails
      FROM
        (${baseQuery}) AS base
      WHERE
        send_to_name = employee_name
      GROUP BY
        empId, employee_name
    `;

      // Add sorting
      const validSortFields = ['employee_name', 'project_name', 'start_date', 'end_date', 'project_status'];
      if (validSortFields.includes(sortField) && (sortOrder === 'ASC' || sortOrder === 'DESC')) {
        filteredQuery += ` ORDER BY ${sortField} ${sortOrder}`;
      }

      if (limit !== -1) {
        filteredQuery += ` LIMIT ${offset}, ${limit}`;
      }

      // Updated count query
      let countQuery = `
      SELECT COUNT(DISTINCT e.empId) AS total
      FROM
        task_management.task_assign_to_employee t
      JOIN
        task_management.task_assignments a ON t.task_id = a.task_id
      JOIN
        task_management.employee_register e ON a.empId = e.empId
      LEFT JOIN
        task_management.message m ON t.task_id = m.task_id AND m.is_deleted = 0 AND a.empId = m.empId
      WHERE
        t.is_deleted = 0
    `;

      if (!roles.includes('Admin') && !roles.includes('Team Leader')) {
        countQuery += ` AND e.empId = ?`;
      }

      // Execute count query
      const totalTasks = roles.includes('Admin') || roles.includes('Team Leader')
        ? await dbConnection.query(countQuery)
        : await dbConnection.query(countQuery, [empId]);

      // Execute main query
      const tasks = roles.includes('Admin') || roles.includes('Team Leader')
        ? await dbConnection.query(filteredQuery)
        : await dbConnection.query(filteredQuery, [empId]);

      return {
        statusCode: HttpStatus.OK,
        message: ResponseMessageEnum.GET,
        data: tasks,
        total: totalTasks[0].total,
      };
    } catch (error) {
      console.error('Error executing getTasksByRole:', error);
      throw error;
    }
  }
  //SETTINGS
  async resetpassword(empId: number, resetDetails: ResetPasswordInterface): Promise<ResponseInterface> {
    try {
      await dbConnection.query(`
      UPDATE task_management.employee_register
      SET employee_name = ?, employee_password = ?, employee_confirmpassword = ?
      WHERE empId = ?
    `, [
        resetDetails.employee_name,
        resetDetails.employee_password,
        resetDetails.employee_confirmpassword,
        empId
      ]);

      return {
        statusCode: HttpStatus.ACCEPTED,
        message: ResponseMessageEnum.UPDATE,
        data: true
      };
    } catch (error) {
      throw error;
    }
  }
}