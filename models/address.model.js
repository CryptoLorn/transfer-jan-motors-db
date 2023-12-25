import { DataTypes } from "sequelize";

import { sequelize } from "../db.js";

export const Address = sequelize.define("address", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    sys_number: {type: DataTypes.INTEGER},
    country: {type: DataTypes.STRING},
    area: {type: DataTypes.STRING},
    city: {type: DataTypes.STRING},
    address: {type: DataTypes.STRING},
    index: {type: DataTypes.STRING}
});