import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
    "infobaza",
    "root",
    "nersul1594vx",
    {
        dialect: "mysql",
        host: "localhost",
        port: 3306
    }
)