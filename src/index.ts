import express from "express";
import { Discord } from "./discord";
import { Web } from "./exress";
import { My } from "./My";
import { Wes } from "./wes";
const app = express();
const PORT:number = 7001;
const config: any = require(`../config.json`);
My.config = config;
app.listen(PORT, "127.0.0.1", () => console.log(`Успещно запущен сервер на ${PORT} порту`));
Discord.run();
Web.run();
Wes.run(PORT+1);