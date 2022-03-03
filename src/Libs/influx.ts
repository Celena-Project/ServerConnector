import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';
const CURRENT_BUCKET = "game-servers";
// You can generate an API token from the "API Tokens Tab" in the UI
const token = 'N5nI2qXPgft9SsXnyV3QcgroWyuty3vtsyl5xhaG2beBU18jXZrtwcQmT0Vr0ghQRtmZ482-Lc3nPvyweGG76A=='
const org = 'celena'
let client: InfluxDB;
let writeApi: WriteApi;
export default class Influx {
    public static run(){
        client = new InfluxDB({url: 'http://celena.pw:8086', token: token, writeOptions: {flushInterval: 1000}});
        writeApi = client.getWriteApi(org, CURRENT_BUCKET);
        Influx.startAliveLoop();
        console.log("Успешно подключился к Influx");
    }
    public static writePoint(point: Point): void{
        writeApi.writePoint(point)
        console.log(point)
    }
    public static writePoints(points: Point[]): void{
        if(points.length > 0){
            writeApi.writePoints(points)
            console.log(points)
        }
    }
    private static startAliveLoop(): void{
        client.getWriteApi(org, "status").writePoint(new Point("server-hub").booleanField("alive", true));
        setInterval(() => {
            client.getWriteApi(org, "status").writePoint(new Point("server-hub").booleanField("alive", true));
        }, 60000);
        
    }
}
// NATIVE
export class InfluxWriter{
    private timingType: UploadTiming;
    private timingMultipler: number;
    private sync: boolean;
    private queue: Point[] = [];
    private queueActions: (() => Point[])[] = [];
    constructor(type: UploadTiming, count: number = 1, sync: boolean = true){
        this.timingType = type;
        this.timingMultipler = count;
        this.sync = sync;

        this.start();
    }
    public addPoint(point: Point): void{
        this.queue.push(point);
    }
    public onGetQueue(action: () => Point[]): void{
        this.queueActions.push(action);
    }
    private start(): void{
        let awaitMills = 0;
        if(this.sync){
            let current = new Date(Date.now());
            switch(this.timingType){
                case "SECOND":{
                    awaitMills = (current.getMilliseconds() == 0 ? 0 : 1000 - current.getMilliseconds()) * this.timingMultipler;
                }
                break;
                case "MINUTE":{
                    awaitMills = 
                    (current.getMilliseconds() == 0 ? 0 : (1000 - current.getMilliseconds())  * this.timingMultipler)
                    + (current.getSeconds() == 0 ? 0 : (60 - current.getSeconds())  * this.timingMultipler) * 1000;
                }
                break;
                case "HOUR":{
                    awaitMills = 
                    (current.getMilliseconds() == 0 ? 0 :  (1000 - current.getMilliseconds())  * this.timingMultipler)
                    + (current.getSeconds() == 0 ? 0 : (60 - current.getSeconds()) * 1000 * this.timingMultipler);
                    + (current.getMinutes() == 0 ? 0 : (60 - current.getMinutes()) * 1000 * this.timingMultipler);
                }
                break;
            }
        }
        let delay = (this.timingType == "SECOND" ? 1000 : this.timingType == "MINUTE" ? 60000 : this.timingType == "HOUR" ? 3600000 : 86400000) * this.timingMultipler;
        setTimeout(() => {
            setInterval(() => {
                let points: Point[] = [];
                for(let k in this.queueActions){
                    let pp = this.queueActions[k]();
                    for(let kz in pp){
                        points.push(pp[kz]);
                    }
                }
                Influx.writePoints(points);
                Influx.writePoints(this.queue);
                this.queue = [];
            }, delay)
        }, awaitMills);
    }
}
export type UploadTiming = "SECOND" | "MINUTE" | "HOUR" | "DAY"