import { Point } from "@influxdata/influxdb-client";
import { Discord } from "./discord";
import Influx, { InfluxWriter } from "./Libs/influx";
import { My } from "./My";
import Socket from "./socket";
const config: any = require(`../data/config.json`);
My.config = config;
Discord.run();
Influx.run();
Socket.run();
let uploader: InfluxWriter = new InfluxWriter("MINUTE");
uploader.onGetQueue(() => {
    let points: Point[] = [];
    My.clients.forEach(x => {
        let online: number = 0;
        let isAlive: boolean = true;
        if(My.servers.has(x.port) && My.servers.get(x.port).data != undefined && My.servers.get(x.port).data.online != undefined  && ( My.servers.get(x.port).lastSync + 16000 > Date.now() )) online = My.servers.get(x.port).data.online;
        else isAlive = false;
        let point = new Point(My.config[x.port.toString()].serverType)
        .tag("port", x.port.toString())
        .booleanField("alive", isAlive);
        if(isAlive) point.intField("online", online);
        points.push(point);
    })
    return points;
});