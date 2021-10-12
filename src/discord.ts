import { My } from "./My";
import {Client} from 'discord.js';
import { IMyServer } from "./features";
export class Discord{
    static run(){
        this.turnObAllBots();
        setInterval(this.updateEmbeds, 5000);
        setInterval(this.updateEmbeds, 5000);
    }
    private static turnObAllBots(): void{
        for(let k in My.config){
            if(!isNaN(parseInt(My.config[k])) && My.config[k]?.inactive == false){
                let client = new Client({intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_PRESENCES", "GUILD_WEBHOOKS"]});
                My.clients[k] = client;
                client.login(My.config[k].token).then(x =>
                    console.log("Зашёл за "+client.user.tag));
                
            }
        }
    }
    private static updateEmbeds(): void{

    }
    private static updateStatus(): void{
        for(let k in My.config){
            if(k.length < 10 && My.clients[k]){
                (My.clients[k] as Client).user.setStatus(!My.servers[k] ? "dnd" : (My.servers[k] as IMyServer).online == 0 ? "idle" : "online");
                let name = !My.servers[k] ? "0 игроков" : `${(My.servers[k] as IMyServer)} игроками`;
                (My.clients[k] as Client).user.setActivity({type: "WATCHING", name});
            }   
        }
    }
}