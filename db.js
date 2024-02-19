import { Sequelize } from "sequelize";

import { DB_NAME, DB_PASSWORD, DB_USER } from "./configs/config.js";

export const sequelize = new Sequelize(
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    {
        dialect: "mysql",
        host: "localhost",
        port: 3306
    }
)