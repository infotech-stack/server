import { Module } from '@nestjs/common';
import { ProjectNameController } from './project-name/project-name.controller';
import { ProjectNameService } from './project-name/project-name.service';

@Module({
  imports: [],
  controllers: [ProjectNameController],
  providers: [ProjectNameService]
})
export class ProjectNameModule {}
