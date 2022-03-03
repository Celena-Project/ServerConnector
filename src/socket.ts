import { Discord } from "./discord";
import { GameType, IMyLog, IMyServerData } from "./features";
import { MyWebSocketServer } from "./Libs/MoWebSocket";
import { MyRequestMessage } from "./Libs/MoWebSocket/features/MyRequestMessage";
import { My } from "./My";

let server: MyWebSocketServer = new MyWebSocketServer(parseInt(process.env.PORT), process.env.IP);
export default class Socket{
    public static run(): void{
        server.listen(() => console.log("Websocket started"));
        server.subscribe(`init`, this.onInit);
        server.subscribe(`info`, this.onInfoUpdate);
        server.subscribe(`log`, this.onLog);
        server.subscribe(`custom`, this.onCustomInfo);
    }
    private static onInit(message: MyRequestMessage): void{
        let struct = JSON.parse(message.content) as IMyInitStruct;
        My.servers.set(struct.port, {socketConnectionId: message.connectionId, port: struct.port, game: struct.game, lastSync: Date.now()});
        console.log("init")
    }
    private static onCustomInfo(message: MyRequestMessage): void{
        if(My.servers.find(x => x.socketConnectionId == message.connectionId) == undefined) return;
        let server = My.servers.find(x => x.socketConnectionId == message.connectionId);
        let data = JSON.parse(message.content) as any;
        server.customData = {type: server.game, data};
        My.servers.set(server.port, server);
        
    }
    private static onInfoUpdate(message: MyRequestMessage): void{
        if(My.servers.find(x => x.socketConnectionId == message.connectionId) == undefined) return;
        let server = My.servers.find(x => x.socketConnectionId == message.connectionId) ?? {};
        let current = My.servers.find(x => x.socketConnectionId == message.connectionId);
        current.data = JSON.parse(message.content) as IMyServerData;
        current.lastSync = Date.now();
        My.servers.set(server["port"], current);
    }
    private static onLog(message: MyRequestMessage): void{
        if(My.servers.find(x => x.socketConnectionId == message.connectionId) == undefined) return;
        let server = My.servers.find(x => x.socketConnectionId == message.connectionId);
        let log = JSON.parse(message.content) as IMyLog;
        Discord.sendLog(server.port, log);
    }
}

interface IMyInitStruct{
    port: number;
    game: GameType;
}