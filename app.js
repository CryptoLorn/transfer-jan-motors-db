import express, {Router} from "express";
import xmlrpc from "xmlrpc";

import {sequelize} from "./db.js";
import {User} from "./models/user.model.js";
import {Passport} from "./models/passport.model.js";
import {configs} from "./configs/config.js";

const app = express();
const router = new Router()

const url = configs.ODOO_URL;
const db = configs.ODOO_DB;
const username = configs.ODOO_USERNAME;
const password = configs.ODOO_PASSWORD;

const common = xmlrpc.createClient({url: `${url}/xmlrpc/2/common`});
const models = xmlrpc.createClient({url: `${url}/xmlrpc/2/object`});

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("", router);

router.post("/user", async (req, res, next) => {
    try {
        const {lead_id, inn_value, phone_number_value} = req.body;

        // const passportData = await Passport.findOne({where: {inn: inn_value}});
        // const userData = await User.findOne({where: {login: phone_number_value}});

        if (inn_value) {
            const passportData = await Passport.findOne({where: {inn: inn_value}});

            if (!passportData) {
                return res.sendStatus(404);
            } else {
                const passportConn = passportData.sys_number;
                const user = await User.findOne({where: {passport_conn: passportConn}});
                const addressConnection = user.address_conn;

                const address = await sequelize.query(
                    'SELECT * FROM infobaza.addresses WHERE sys_number BETWEEN :start AND :end',
                    {
                        replacements: { start: addressConnection, end: addressConnection },
                        type: sequelize.QueryTypes.SELECT
                    }
                );

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
                                                partner_id: foundPartnerId,
                                                phone_number: user.login,
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
                                                x_studio_issued: passportData.issued,
                                                x_studio_inn: passportData.inn,
                                                x_studio_client_address: `${address[0]?.area} ${address[0]?.city} ${address[0]?.address}`,
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
                                                            partner_id: newRecordId,
                                                            phone_number: user.login,
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
        } else if (phone_number_value) {
            const userData = await User.findOne({where: {login: phone_number_value}});

            if (!userData) {
                return res.sendStatus(404);
            } else {
                const addressConnection = userData.address_conn;
                const passportConn = userData.passport_conn;
                const passport = await Passport.findOne({where: {sys_number: passportConn}});

                const address = await sequelize.query(
                    'SELECT * FROM infobaza.addresses WHERE sys_number BETWEEN :start AND :end',
                    {
                        replacements: { start: addressConnection, end: addressConnection },
                        type: sequelize.QueryTypes.SELECT
                    }
                );

                await common.methodCall(
                    "authenticate",
                    [db, username, password, {}],
                    async (authError, uid) => {
                        if (authError) {
                            console.error("Authentication error:", authError);
                        } else {
                            console.log("Auth success. UID user:", uid);

                            const searchSeries = [
                                ["x_studio_series", "=", passport.series]
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
                                                partner_id: foundPartnerId,
                                                info_baza: passport.inn,
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
                                                name: userData.surname + " " + userData.name + " " + userData.middlename,
                                                phone: userData.login,
                                                x_studio_series: passport.series,
                                                x_studio_data_of_issue: passport.date,
                                                x_studio_issued: passport.issued,
                                                x_studio_inn: passport.inn,
                                                x_studio_client_address: `${address[0]?.area} ${address[0]?.city} ${address[0]?.address}`,
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
                                                            partner_id: newRecordId,
                                                            info_baza: passport.inn,
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
        }
    } catch (e) {
        return res.json(e);
    }
})

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        app.listen(configs.PORT, () => console.log(`Server on port ${configs.PORT}`));
    } catch (e) {
        console.log(e);
    }
}

start();