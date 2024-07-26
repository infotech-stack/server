import { ApiProperty } from "@nestjs/swagger";

export class InsertEmployeeDto {
    @ApiProperty()
    employee_name: string
    @ApiProperty()
    employee_designation: string
    @ApiProperty()
    employee_cabinno: string
    @ApiProperty()
    employee_dateofjoin: Date
    @ApiProperty()
    employee_address: string
    @ApiProperty()
    employee_contactno: number
    @ApiProperty()
    employee_password: string
    @ApiProperty()
    employee_confirmpassword: string
    @ApiProperty()
    employee_email: string;
    @ApiProperty()
    employee_date_of_birth: Date;
    @ApiProperty()
    employee_religion: string;
    @ApiProperty()
    employee_education: string;
    @ApiProperty()
    employee_experience: string;
    @ApiProperty()
    employee_role: number[];
    @ApiProperty()
    employee_access: number[];
}
export class loginDto {
    @ApiProperty()
    employee_name: string
    @ApiProperty()
    employee_password: string
}
export class TaskAssignDto {
    @ApiProperty()
    start_date: Date;
    @ApiProperty()
    end_date: Date;
    @ApiProperty()
    project_status: string;
    @ApiProperty()
    is_deleted: number;
    @ApiProperty()
    project_name: string;
    @ApiProperty()
    assignTo: number[];

}
export class GetTaskByRolesDto {
    @ApiProperty({ type: [String] })
    roles: string[];
}
export class TaskReportsDto {
    @ApiProperty()
    project_status: string
}
export class InsertMessageDto {
    @ApiProperty()
    message_description: string;
    @ApiProperty()
    filename: string[];
    @ApiProperty()
    is_deleted: number;
    @ApiProperty()
    empId: number;
    @ApiProperty()
    send_by: number;
}