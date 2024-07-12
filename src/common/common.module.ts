import { Module } from "@nestjs/common";
import { DateTimeService } from "./services/date-time/date-time.service";
import { HelperService } from "./services/helper/helper.service";

@Module({
  providers: [HelperService, DateTimeService],
  exports: [HelperService, DateTimeService],
})
export class CommonModule {}
