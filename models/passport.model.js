import { DataTypes } from "sequelize";

import { sequelize } from "../db.js";

export const Passport = sequelize.define("passport", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    sys_number: {type: DataTypes.INTEGER},
    inn: {type: DataTypes.STRING},
    date: {type: DataTypes.STRING},
    series: {type: DataTypes.STRING},
    issued: {type: DataTypes.STRING},
});