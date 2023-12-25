import express, { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import xmlrpc from "xmlrpc";

import { sequelize } from "./db.js";
import { User } from "./models/user.model.js";
import { Address } from "./models/address.model.js";
import { Passport } from "./models/passport.model.js";
import { Anketa } from "./models/anketa.model.js";

const app = express();
const router = new Router();
const __dirname = path.resolve();

const url = "https://topsecretadmin-secretportal-secretportal-10028598.dev.odoo.com";
const db = "topsecretadmin-secretportal-secretportal-10028598";
const username = "otk_protonmail@protonmail.com";
const password = "d402c21b31d40211a48c98f47e6e288d9a3853bd";

const common = xmlrpc.createClient({url: `${url}/xmlrpc/2/common`});
const models = xmlrpc.createClient({url: `${url}/xmlrpc/2/object`});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", router);

router.get("/user", async (req, res) => {
    console.log("ok");
    return res.json("ok");
})

router.post("/user", async (req, res, next) => {
    try {
        const {lead_id, inn_value} = req.body;

        const passportData = await Passport.findOne({where: {inn: inn_value}});
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

                                    const recordId = 131;

                                    await models.methodCall(
                                        "execute_kw",
                                        [db, uid, password, "crm.lead", "write", [[recordId], updatedData]],
                                        (updateError) => {
                                            if (updateError) {
                                                console.error("Update item error:", updateError);
                                            } else {
                                                console.log("Success updated item with id:", recordId);
                                                return res.json("ok");
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

                                                const recordId = 131;

                                                await models.methodCall(
                                                    "execute_kw",
                                                    [db, uid, password, "crm.lead", "write", [[recordId], updatedData]],
                                                    (updateError) => {
                                                        if (updateError) {
                                                            console.error("Update item error:", updateError);
                                                        } else {
                                                            console.log("Success updated item with id:", recordId);
                                                            return res.json("ok");
                                                        }
                                                    });
                                            }
                                        });
                                }
                            }
                    })
                }
            });
    } catch (e) {
        return res.json(e);
    }
})


// Work version -------------------------------------------------------------------------
// const readStream = fs.createReadStream(path.join(__dirname, "anketa.txt"));
//
// let chunks = [];
// let chunkCount = 0;
//
// readStream.on("data", (chunk) => {
//     chunks.push(chunk);
//     chunkCount++;
//
//     // count* people: 41117 | address: 22898 | passport: 26775
//     if (chunkCount === 5000) {
//         const concatenatedBuffer = Buffer.concat(chunks);
//
//         const newFileName = `output_${Date.now()}.txt`;
//         fs.writeFile(`${path.join(__dirname)}/anketa-chunk/${newFileName}`, concatenatedBuffer, {encoding: "utf-8"}, (err) => {
//             if (err) throw err;
//             console.log(`Saved ${newFileName}`);
//         });
//
//         chunks = [];
//         chunkCount = 0;
//     }
// })
//
// readStream.on("end", () => {
//     if (chunks.length > 0) {
//         const concatenatedBuffer = Buffer.concat(chunks);
//         const newFileName = `output_${Date.now()}.txt`;
//         fs.writeFile(`${path.join(__dirname)}/anketa-chunk/${newFileName}`, concatenatedBuffer, {encoding: "utf-8"}, (err) => {
//             if (err) throw err;
//             console.log(`Saved ${newFileName}`);
//         });
//     }
//
//     console.log("Reading and processing complete.");
// });


// Work version create user db --------------------------------------------------------------------------------
// fs.readFile(`${path.join(__dirname, "users-chunk", "people1.txt")}`, "utf-8", async (err, fileContent) => {
//     if (err) console.log(err);
//
//     const lines = fileContent.split('\n');
//
//     for (let i = 1; i < lines.length; i++) {
//         const fields = lines[i].split('|');
//
//         const user = {
//             login: fields[3].trim(),
//             surname: fields[4].trim(),
//             name: fields[5].trim(),
//             middlename: fields[6].trim(),
//             sex: parseInt(fields[7].trim(), 10),
//             dateB: fields[8].trim(),
//             key: fields[9].trim(),
//             nationality: fields[10].trim(),
//             address_conn: fields[13].trim(),
//             passport_conn: fields[14].trim(),
//             anketa_conn: fields[15].trim()
//         };
//
//         await User.create(user);
//     }
// });

// Work version create address db------------------------------------------------------------------------------
// fs.readFile(`${path.join(__dirname, "address-chunk", "address5.txt")}`, "utf-8", async (err, fileContent) => {
//     if (err) console.log(err);
//
//     const lines = fileContent.split('\n');
//
//     for (let i = 1; i < lines.length; i++) {
//         const fields = lines[i].split('|');
//
//         const address = {
//             sys_number: fields[0].trim(),
//             country: fields[2].trim(),
//             area: fields[3].trim(),
//             city: fields[4].trim(),
//             address: fields[5].trim(),
//             index: fields[6].trim(),
//         };
//
//         await Address.create(address);
//     }
// });


// Work version create passport db------------------------------------------------------------------------------
// fs.readFile(`${path.join(__dirname, "passport-chunk", "passport1.txt")}`, "utf-8", async (err, fileContent) => {
//     if (err) console.log(err);
//
//     const lines = fileContent.split('\n');
//
//     for (let i = 1; i < lines.length; i++) {
//         const fields = lines[i].split('|');
//
//         const passport = {
//             sys_number: fields[0].trim(),
//             inn: fields[2].trim(),
//             date: fields[3].trim(),
//             series: fields[4].trim(),
//             issued: fields[5].trim()
//         };
//
//         await Passport.create(passport);
//     }
// });



// Work version create anketa db------------------------------------------------------------------------------
// fs.readFile(`${path.join(__dirname, "anketa-chunk", "anketa6.txt")}`, "utf-8", async (err, fileContent) => {
//     if (err) console.log(err);
//
//     const lines = fileContent.split('\n');
//
//     for (let i = 1; i < lines.length; i++) {
//         const fields = lines[i].split('|');
//
//         const anketa = {
//             sys_number: fields[0].trim(),
//             Fstatus: fields[2].trim(),
//             education: fields[3].trim(),
//             children: fields[4].trim(),
//             car: fields[5].trim(),
//             Sstatus: fields[6].trim(),
//             Sposition: fields[7].trim(),
//             position: fields[8].trim(),
//             company: fields[9].trim(),
//             living: fields[10].trim()
//         };
//
//         await Anketa.create(anketa);
//     }
// });

const start = async () => {
    try {
        // await sequelize.authenticate();
        // await sequelize.sync();
        app.listen(5001, () => console.log(`Server on port 5001`));
    } catch (e) {
        console.log(e);
    }
}

start();