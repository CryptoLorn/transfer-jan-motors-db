import { Sequelize } from "sequelize";

import { configs } from "./configs/config.js";

export const sequelize = new Sequelize(
    configs.DB_NAME,
    configs.DB_USER,
    configs.DB_PASSWORD,
    {
        dialect: "mysql",
        host: "localhost",
        port: 3306
    }
)