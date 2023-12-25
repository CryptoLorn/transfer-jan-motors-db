import { DataTypes } from "sequelize";

import { sequelize } from "../db.js";

export const User = sequelize.define("user", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    login: {type: DataTypes.STRING},
    surname: {type: DataTypes.STRING},
    name: {type: DataTypes.STRING},
    middlename: {type: DataTypes.STRING},
    sex: {type: DataTypes.INTEGER},
    dateB: {type: DataTypes.STRING},
    key: {type: DataTypes.STRING},
    nationality: {type: DataTypes.STRING},
    address_conn: {type: DataTypes.STRING},
    passport_conn: {type: DataTypes.STRING},
    anketa_conn: {type: DataTypes.STRING},
});