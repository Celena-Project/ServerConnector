import {Client} from "discord.js";
export type ServerType = "SCP" | "MC" | "SE";
export type reqType = "log" | "data";
export interface IMyClient{
    port: number;
    client: Client;
}
export interface IMyLog{
    port: number;
    type: string; // 1/2/3/..
    message: string;
}
export interface IMyRequest{
    port: number;
    online: number;
    data: IMyScpData | IMyMcData | IMySeData;
    serverType: ServerType;
}
export interface IMySocketData{
    type: reqType;
    request: IMyRequest | IMyLog;
}
export interface IMyScpData{
    admins: number;
    alivePlayers: number;
    roundRunning: boolean;
    warheadIsActive: boolean;
    lczContaimented: boolean;
    kills: number;
    openedDoors: number;
    usedMedKit: number;
    uptime: number;
}
export interface IMyMcData{
    tps: number;
    uptime: number;
}
export interface IMySeData{

}