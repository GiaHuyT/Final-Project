import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();
console.log('ENV_CHECK_START');
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET);
console.log('PORT:', process.env.PORT);
console.log('ENV_CHECK_END');
