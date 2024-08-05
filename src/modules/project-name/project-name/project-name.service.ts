import { Injectable } from '@nestjs/common';

@Injectable()
export class ProjectNameService {
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
  // async getTasksByRole(
  //   empId: number,
  //   roles: string[],
  //   page: number,
  //   limit: number,
  //   sortField: string = 'employee_name',
  //   sortOrder: string = 'ASC'
  // ): Promise<ResponseInterface> {
  //   try {
  //     const offset = (page - 1) * limit; // Adjust offset calculation
  //     let query = `
  //       SELECT
  //         e.empId,
  //         e.employee_name,
  //         JSON_ARRAYAGG(
  //           JSON_OBJECT(
  //             'task_id', t.task_id,
  //             'start_date', DATE_FORMAT(t.start_date,'%Y-%m-%d %H:%i:%s'),
  //             'end_date', DATE_FORMAT(t.end_date,'%Y-%m-%d %H:%i:%s'),
  //             'project_status', a.project_status,
  //             'is_deleted', t.is_deleted,
  //             'project_name', t.project_name
  //           )
  //         ) AS taskDetails,
  //          JSON_ARRAYAGG(
  //             JSON_OBJECT(

  //             )
  //          )
  //       FROM
  //         task_management.task_assign_to_employee t
  //       JOIN
  //         task_management.task_assignments a ON t.task_id = a.task_id
  //       JOIN
  //         task_management.employee_register e ON a.empId = e.empId
  //       WHERE
  //         t.is_deleted = 0
  //     `;

  //     if (roles.includes('Admin') || roles.includes('Team leader')) {
  //       query += ` GROUP BY e.empId`;
  //     } else {
  //       query += ` AND e.empId = ? GROUP BY e.empId`;
  //     }

  //     // Add sorting
  //     const validSortFields = ['employee_name', 'project_name', 'start_date', 'end_date', 'project_status'];
  //     if (validSortFields.includes(sortField) && (sortOrder === 'ASC' || sortOrder === 'DESC')) {
  //       query += ` ORDER BY ${sortField} ${sortOrder}`;
  //     }

  //     // Add pagination
  //     if (limit !== -1) {
  //       query += ` LIMIT ${limit} OFFSET ${offset}`;
  //     }

  //     // Counting total records
  //     let countQuery = `
  //       SELECT COUNT(*) as total
  //       FROM task_management.task_assign_to_employee t
  //       JOIN task_management.task_assignments a ON t.task_id = a.task_id
  //       JOIN task_management.employee_register e ON a.empId = e.empId
  //       WHERE t.is_deleted = 0
  //     `;

  //     if (!roles.includes('Admin') && !roles.includes('Team Leader')) {
  //       countQuery += ` AND e.empId = ?`;
  //     }

  //     const totalTasks = roles.includes('Admin') || roles.includes('Team Leader')
  //       ? await dbConnection.query(countQuery)
  //       : await dbConnection.query(countQuery, [empId]);

  //     // Fetching paginated results
  //     const tasks = roles.includes('Admin') || roles.includes('Team Leader')
  //       ? await dbConnection.query(query)
  //       : await dbConnection.query(query, [empId]);

  //     return {
  //       statusCode: HttpStatus.OK,
  //       message: ResponseMessageEnum.GET,
  //       data: tasks,
  //       total: totalTasks[0].total,
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // }
   // async updateTask(taskId: number, empId: number, formData: TaskAssignInterface): Promise<ResponseInterface> {
  //   try {
  //     const start = new Date(formData.start_date).toISOString().slice(0, 19).replace('T', ' ');
  //     const end = new Date(formData.end_date).toISOString().slice(0, 19).replace('T', ' ');

  //     if (empId) {
  //       try {
  //         // Update task details
  //         await dbConnection.query(
  //           `
  //           UPDATE task_management.task_assign_to_employee
  //           SET
  //             project_name = ?,
  //             start_date = ?,
  //             end_date = ?,
  //             project_status = ?,
  //             is_deleted = ?
  //             WHERE task_id = ?
  //           `,
  //           [
  //             formData.project_name,
  //             start,
  //             end,
  //             formData.project_status,
  //             0,
  //             taskId
  //           ]
  //         );

  //         // Remove old assignments
  //         await dbConnection.query(
  //           `
  //           DELETE FROM task_management.task_assignments
  //           WHERE task_id = ? AND empId = ?
  //           `,
  //           [taskId,empId]
  //         );

  //         // Insert new task assignments
  //         for (const empId of formData.assignTo) {
  //           await dbConnection.query(
  //             `
  //             INSERT INTO task_management.task_assignments
  //             (
  //               task_id,
  //               empId,
  //               project_status

  //             ) 
  //             VALUES (?, ?, ?)
  //             `,
  //             [
  //               taskId,
  //               empId,
  //               formData.project_status

  //             ]
  //           );
  //         }


  //         return {
  //           statusCode: HttpStatus.OK,
  //           message: ResponseMessageEnum.UPDATE,
  //           data: true
  //         };
  //       } catch (error) {

  //         throw error;
  //       } finally {

  //       }
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // }
    // async postMessage(message: InsertMessageInterface):Promise<ResponseInterface> {
  //   try {
  //     console.log(message, 'service');

  //     const files = JSON.stringify(message.filename);
  //     await dbConnection.query(`
  //       INSERT INTO task_management.message
  //       (
  //         message_description,
  //         filename,
  //         is_deleted,
  //         empId,
  //         send_by
  //       )
  //       VALUES (?, ?, ?, ?, ?)`,
  //       [
  //         message.message_description,
  //         files,
  //         0,
  //         message.empId,
  //         message.send_by
  //       ]);
  //     return {
  //       statusCode: HttpStatus.OK,
  //       message: ResponseMessageEnum.ADD,
  //       data: true
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
