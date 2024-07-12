import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

@Injectable()
export class DateTimeService {
  // var timeZoneIanaString = "Asia/Kolkata";

  getDateTime(timeZoneIanaString: string) {
    return DateTime.local({
      zone: timeZoneIanaString,
    }).toFormat('yyyy-MM-dd TT');
  }

  getDate(timeZoneIanaString: string) {
    return DateTime.local({ zone: timeZoneIanaString }).toFormat('yyyy-MM-dd');
  }

  getTime(timeZoneIanaString: string) {
    return DateTime.local({ zone: timeZoneIanaString }).toFormat('TT');
  }

  setDateTime(dateTime: Date) {
    DateTime;
    let convertDateTime = DateTime.fromISO(dateTime).toFormat('yyyy-MM-dd TT');
    return convertDateTime;
  }

  cuttentTimestamp(): Promise<any> {
    let { DateTime } = require('luxon');
    var TimeZoneIanaString = 'Asia/Kolkata';
    var local = DateTime.local({ zone: TimeZoneIanaString }); //
    var serverLocalDateAndTimeFormate = DateTime.local({
      zone: TimeZoneIanaString,
    }).toFormat('yyyy-MM-dd TT');
    return serverLocalDateAndTimeFormate;
  }
}
