import { Injectable } from '@nestjs/common';
import { dbConnection } from '../../../app.module';

@Injectable()
export class HelperService {
  // -- Check The Table exist or not -----
  async tableExists(dbName: string, tableName: string): Promise<boolean> {
    try {
      const tableExists = await dbConnection.query(
        `
        SELECT * 
          FROM information_schema.tables
          WHERE table_schema = '${dbName}'
              AND table_name = '${tableName}'
          LIMIT 1;
        `,
      );

      if (tableExists.length == 0) return true; //TABLE not exist then return true

      return false; //TABLE exist then return false
    } catch (error) {
      throw error;
    }
  }

  // -- Check The Database exist or not -----
  async dbExists(dbName: string): Promise<boolean> {
    try {
      const dbExists = await dbConnection.query(
        `
        SELECT SCHEMA_NAME
        FROM INFORMATION_SCHEMA.SCHEMATA
        WHERE SCHEMA_NAME = '${dbName}';
        `,
      );

      if (dbExists.length == 0) return true; //TABLE not exist then return true

      return false; //TABLE exist then return false
    } catch (error) {
      throw error;
    }
  }
}
