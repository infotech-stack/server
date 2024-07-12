/* eslint-disable prettier/prettier */
import { extname } from "path";



// Check file type
export const fileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|svg|gif|txt|pdf|mp4|docx|xlsx)$/)) {
    // req.fileValidationError = "Invalid file type not supported";
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};

// Change File name
export const editFileName = (req, file, callback) => {
    const customer_id = req.body.customer_id;
    const country_code = req.body.country_code;
    const user_id = req.body.uploaded_created_by_user_id;
    const app_id = req.body.app_id;
  const name = file.originalname.split('.')[0];
  const fileExtensionName = extname(file.originalname);

  // const randomName = Array(4)
  //   .fill(null)
  //   .map(() => Math.round(Math.random() * 16).toString(16))
  //   .join(''); 

  const random = new Date().toISOString();

  callback(null, `${country_code}_${customer_id}_${user_id}_${app_id}_${name}_${random.replace(/:/g, '-')}${fileExtensionName}`);// Todo change file name  to this format  domain_custid_appId_userId_fileName
};

// Create Dynamic Directory 
export const destination = async (req, file, callback,): Promise<any> => {
  const body = req.body;
  const basePath = process.env.BASE_PATH;

  // const dbName =
  //   body.country_code +
  //   '_' +
  //   body.customer_id +
  //   '_' +
  //   process.env.CUSTOMER_DB;

  // const userFileStorage = await dbConnection.query(`
  //   SELECT SUM(a.file_size) as user_used_storage,(
  //   SELECT storage_limit_in_mb FROM ${dbName}.5_userapp_cloud_file_storage_users_master
  //   WHERE user_id=${body.uploaded_created_by_user_id}
  //   )-SUM(a.file_size) as user_remaining_storage,
  //   (SELECT storage_limit_in_mb FROM ${dbName}.5_userapp_cloud_file_storage_users_master
  //   WHERE user_id=${body.uploaded_created_by_user_id})as user_total_storage
  //   FROM ${dbName}.5_userapp_files_master a
  //   LEFT JOIN ${dbName}.${body.uploaded_created_by_user_id}_user_5_userapp_folders_and_files b ON a.cloud_file_id=b.file_or_folder_id
  //   WHERE a.uploaded_created_by_user_id=${body.uploaded_created_by_user_id};
  // `).then(data => data[0]);

  // userFileStorage.user_remaining_storage = userFileStorage.user_remaining_storage ?? userFileStorage.user_total_storage;
  // const checkStorageSize = userFileStorage.user_remaining_storage >= body.file_size;


  // const customer_dir = basePath + '/' + body.customer_id;
  // const user_id = customer_dir + '/' + body.uploaded_created_by_user_id + '/';
  // const path = user_id + '/' + body.app_id;

  // if (!fs.existsSync(path)) {
  //   if (!fs.existsSync(customer_dir)) fs.mkdirSync(customer_dir);
  //   if (!fs.existsSync(user_id)) fs.mkdirSync(user_id);
  //   if (!fs.existsSync(path)) fs.mkdirSync(path);
  // }

  // if (checkStorageSize) return callback(null, path);
  // else return callback(new Error('Check your storage limit'), null);

  // return callback(null, path);
  return callback(null, basePath);
};
