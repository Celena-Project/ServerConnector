import { Discord } from "./discord";
import { IMyLog, IMyRequest, IMySocketData, reqType } from "./features";
import { My } from "./My";

var WebSocketServer = require('websocket').server;
var http = require('http');
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
let ws: any;
export class Wes{
    public static PORT: number;
    public static run(port: number): void{
        this.PORT = port;
        this.setup();
    }
    private static setup(){
        server.listen(this.PORT, "127.0.0.1", () => console.log(`WebSocket started at ${this.PORT} port`));
        ws = new WebSocketServer({
            httpServer: server,
            autoAcceptConnections: false
        });
        ws.on('request', request => request(request));
        
    }
    private static request(request: any) {
        // if (!originIsAllowed(request.origin)) {
        //   // Make sure we only accept requests from an allowed origin
        //   request.reject();
        //   console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        //   return;
        // }
        
        var connection = request.accept('echo-protocol', request.origin);
        console.log((new Date()) + ' Connection accepted.');
        connection.on('message', function(message) {
            let dataa = JSON.parse(message) as IMySocketData;
            if (message.type === 'utf8') {
                let type = dataa.type as reqType;
            if(type == "log"){
                Discord.sendLog(dataa.request as IMyLog);
            }else{
                let data = dataa.request as IMyRequest;
                My.servers[data.port] = data;
            }
            }
        });
        connection.on('close', function(reasonCode, description) {});
    };
}