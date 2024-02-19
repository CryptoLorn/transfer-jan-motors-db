import express, { Router } from "express";
import xmlrpc from "xmlrpc";

import { sequelize } from "./db.js";
import { User } from "./models/user.model.js";
import { Passport } from "./models/passport.model.js";
import { ODOO_DB, ODOO_PASSWORD, ODOO_URL, ODOO_USERNAME, PORT } from "./configs/config.js";

const app = express();
const router = new Router();

const url = ODOO_URL;
const db = ODOO_DB;
const username = ODOO_USERNAME;
const password = ODOO_PASSWORD;

const common = xmlrpc.createClient({url: `${url}/xmlrpc/2/common`});
const models = xmlrpc.createClient({url: `${url}/xmlrpc/2/object`});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("", router);

router.post("/user", async (req, res, next) => {
    try {
        const {lead_id, inn_value} = req.body;

        const passportData = await Passport.findOne({where: {inn: inn_value}});
        if (!passportData || !inn_value) {
            return res.sendStatus(404);
        } else {
            const passportConn = passportData.sys_number;
            const user = await User.findOne({where: {passport_conn: passportConn}});

            await common.methodCall(
                "authenticate",
                [db, username, password, {}],
                async (authError, uid) => {
                    if (authError) {
                        console.error("Authentication error:", authError);
                    } else {
                        console.log("Auth success. UID user:", uid);

                        const searchSeries = [
                            ["x_studio_series", "=", passportData.series]
                        ];

                        await models.methodCall(
                            "execute_kw",
                            [db, uid, password, "res.partner", "search", [searchSeries]],
                            async (searchError, partnerIds) => {
                                if (searchError) {
                                    console.error("Search error:", searchError);
                                } else {
                                    if (partnerIds.length > 0) {
                                        const foundPartnerId = partnerIds[0];

                                        const updatedData = {
                                            partner_id: foundPartnerId
                                        };

                                        await models.methodCall(
                                            "execute_kw",
                                            [db, uid, password, "crm.lead", "write", [[lead_id], updatedData]],
                                            (updateError) => {
                                                if (updateError) {
                                                    console.error("Update item error:", updateError);
                                                } else {
                                                    console.log("Success updated item with id:", lead_id);
                                                    return res.json("Успішно оновлено дані");
                                                }
                                            });
                                    } else {
                                        const newPartner = {
                                            name: user.surname + " " + user.name + " " + user.middlename,
                                            phone: user.login,
                                            x_studio_series: passportData.series,
                                            x_studio_data_of_issue: passportData.date,
                                            x_studio_issued: passportData.issued
                                        }

                                        await models.methodCall(
                                            "execute_kw",
                                            [db, uid, password, "res.partner", "create", [newPartner]],
                                            async (createError, newRecordId) => {
                                                if (createError) {
                                                    console.error("Create item error:", createError);
                                                } else {
                                                    console.log("Success created item with id:", newRecordId);

                                                    const updatedData = {
                                                        partner_id: newRecordId
                                                    };

                                                    await models.methodCall(
                                                        "execute_kw",
                                                        [db, uid, password, "crm.lead", "write", [[lead_id], updatedData]],
                                                        (updateError) => {
                                                            if (updateError) {
                                                                console.error("Update item error:", updateError);
                                                            } else {
                                                                console.log("Success updated item with id:", lead_id);
                                                                return res.json("Інформація додана успішно");
                                                            }
                                                        });
                                                }
                                            });
                                    }
                                }
                            })
                    }
                });
        }
    } catch (e) {
        return res.json(e);
    }
})

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        app.listen(PORT, () => console.log(`Server on port ${PORT}`));
    } catch (e) {
        console.log(e);
    }
}

start();