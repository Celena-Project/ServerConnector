import {Collection} from "discord.js";
import { IMyClient, IMyRequest } from "./features";
import {Express} from "express";
export class My{
    public static clients: Collection<number, IMyClient> = new Collection<number, IMyClient>();
    public static servers: Collection<number, IMyRequest> = new Collection<number, IMyRequest>();
    public static config: any;
    public static express: Express;
}