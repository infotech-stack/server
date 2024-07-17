export interface InsertEmployeeInterface {
    employee_name: string;
    employee_designation: string;
    employee_cabinno: string;
    employee_dateofjoin: Date;
    employee_address: string;
    employee_contactno: number;
    employee_password: string;
    employee_confirmpassword: string;
    employee_role: string[];
    employee_access: string[];
    employee_email: string;
    employee_date_of_birth: Date;
    employee_religion: string;
    employee_education: string;
    employee_experience: string;
}

export interface LoginInterface {
    employee_name: string;
    employee_password: string;
}
export interface TaskAssignInterface {

    start_date: Date;
    end_date: Date;
    project_status: string;
    is_deleted: number;
    project_name: string;
    assignTo: number[];
}
export interface GetTaskByRolesInterface {
    roles: string[];
}
export interface TaskReportsInterface {

    project_status: string
}
export interface InsertMessageInterface{
    message_description: string;
    filename: string[];
    is_deleted: number;
    empId: number;
    send_by: number;
}