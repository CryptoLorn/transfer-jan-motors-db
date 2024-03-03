import { config } from 'dotenv';

config();

export const configs = {
    PORT: process.env.PORT || 5001,

    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,

    ODOO_URL: process.env.ODOO_URL,
    ODOO_DB: process.env.ODOO_DB,
    ODOO_USERNAME: process.env.ODOO_USERNAME,
    ODOO_PASSWORD: process.env.ODOO_PASSWORD,
}