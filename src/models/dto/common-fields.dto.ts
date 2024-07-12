/* eslint-disable prettier/prettier *//* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";

export class CommonFieldsDto {
  @ApiProperty({default:100})
  customer_id:number
  @ApiProperty({default:'in'})
  country_code:string
}
