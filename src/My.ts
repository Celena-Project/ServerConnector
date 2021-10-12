import {Collection} from "discord.js";
import { IMyClient, IMyServer } from "./features";
export class My{
    public static clients: Collection<number, IMyClient> = new Collection<number, IMyClient>();
    public static servers: Collection<number, IMyServer> = new Collection<number, IMyServer>();
    public static config: any;
}