import {Client} from "discord.js";
export interface IMyServer{
    port: number;
    online: number;
    args: any;
}
export interface IMyClient{
    port: number;
    client: Client;
}