import {Client} from "discord.js";
export interface IMyClient{
    port: number;
    client: Client;
}
export interface IMyServer{
    port: number;
    game: GameType;
    data?: IMyServerData;
    customData?: IMyCustomData;
    socketConnectionId: string;
    lastSync: number;
}
export interface IMyServerData{
    online: number;
    elapsed: number;
}
export interface IMyLog{
    content: string;
    channel: number;
}
export interface IMyCustomData{
    type: GameType;
    data: any;
}
export type GameType = "sl" | "se" | "mc" | "ru" | "sw" | "fc" | "le"

// Custom server data
export interface IMySlCustomServerData{
    kills: number;
    spectators: number;
    escaped: number;
    round: boolean;
    uptime: number;
    decontamination: boolean;
    perms: number;
    warhead: boolean;
}
export interface IMySeCustomServerData{
    simspeed: number;
}