import { Request, Response} from "express";
import { Discord } from "./discord";
import { IMyLog, IMyRequest, reqType } from "./features";
import { My } from "./My";
export class Web{
    static run(){
        My.express.post(`/`, async (req: Request, res: Response) => {
            let type = (req.body?.type || req.query?.type) as reqType;
            if(type == "log"){
                Discord.sendLog((req.body?.data || req.query?.data) as IMyLog);
            }else{
                let data = JSON.parse((req.body?.data || req.query?.data)) as IMyRequest;
                My.servers[data.port] = data;
            }
        });
    }
   
}