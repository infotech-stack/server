import { Module } from '@nestjs/common';
import { EmployeeRegisterController } from './employee-register/employee-register.controller';
import { EmployeeRegisterService } from './employee-register/employee-register.service';
import { MessageModule } from './message/message.module';


@Module({
  controllers: [EmployeeRegisterController],
  providers: [EmployeeRegisterService],
  // imports:[MessageModule]
})
export class TaskManagementModule {}
