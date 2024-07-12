import { Module } from '@nestjs/common';
import { EmployeeRegisterController } from './employee-register/employee-register.controller';
import { EmployeeRegisterService } from './employee-register/employee-register.service';

@Module({
  controllers: [EmployeeRegisterController],
  providers: [EmployeeRegisterService],
})
export class TaskManagementModule {}
