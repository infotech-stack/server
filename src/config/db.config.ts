/* eslint-disable prettier/prettier */
import { DataSourceOptions } from 'typeorm';

export default ():DataSourceOptions => ({
  type: < "mysql" | "mariadb">process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});
