import { config } from 'dotenv'
config();
export const configs = {
    LOTW_USER: process.env.LOTW_USER,
    LOTW_PWD: process.env.LOTW_PWD
}