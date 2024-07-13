import { ApiProperty } from "@nestjs/swagger";

export class InsertEmployeeDto{
    @ApiProperty()
    employee_name:string
    @ApiProperty()
    employee_designation:string
    @ApiProperty()
    employee_cabinno:string
    @ApiProperty()
    employee_dateofjoin:Date
    @ApiProperty()
    employee_address:string
    @ApiProperty()
    employee_contactno:number
    @ApiProperty()
    employee_password:string
    @ApiProperty()
    employee_confirmpassword:string
    @ApiProperty()
    employee_role:string[]
    @ApiProperty()
    employee_access:string[]
}
export class loginDto{
    @ApiProperty()
    employee_name:string
    @ApiProperty()
    employee_password:string
}
export class TaskAssignDto{

  
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