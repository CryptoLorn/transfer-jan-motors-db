import { DataTypes } from "sequelize";

import { sequelize } from "../db.js";

export const Anketa = sequelize.define("anketa", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    sys_number: {type: DataTypes.INTEGER},
    Fstatus: {type: DataTypes.STRING},
    education: {type: DataTypes.STRING},
    children: {type: DataTypes.STRING},
    car: {type: DataTypes.STRING},
    Sstatus: {type: DataTypes.STRING},
    Sposition: {type: DataTypes.STRING},
    position: {type: DataTypes.STRING},
    company: {type: DataTypes.STRING},
    living: {type: DataTypes.STRING}
});