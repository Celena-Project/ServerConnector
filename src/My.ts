import {Collection} from "discord.js";
import { IMyClient, IMyServer, IMyServerData } from "./features";
import {Express} from "express";
export class My{
    public static clients: Collection<number, IMyClient> = new Collection<number, IMyClient>();
    public static servers: Collection<number, IMyServer> = new Collection<number, IMyServer>();
    public static config: any = require(`../data/config.json`)
}