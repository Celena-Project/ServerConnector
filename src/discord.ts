import { My } from "./My";
import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { IMyLog, IMyMcData, IMyRequest, IMyScpData } from "./features";
export class Discord {
    static run() {
        this.turnObAllBots();
        setInterval(this.updateEmbeds, 5000);
        setInterval(this.updateEmbeds, 5000);
    }
    private static client: Client;
    private static turnObAllBots(): void {
        this.client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_PRESENCES", "GUILD_WEBHOOKS"] });
        this.client.login(My.config.sharedConfig.bot.token);
        this.client.on(`ready`, () => console.log(this.client.user.tag + " подключился"));
        for (let k in My.config) {
            if (!isNaN(parseInt(My.config[k])) && My.config[k]?.inactive == false) {
                let client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_PRESENCES", "GUILD_WEBHOOKS"] });
                My.clients[k] = client;
                client.login(My.config[k].token).then(x =>
                    console.log("Зашёл за " + client.user.tag));

            }
        }
    }
    public static MAX_SYMBOLS: number = 1990;
    public static async sendLog(log: IMyLog): Promise<void> {
        if (My.clients[log.port] == undefined) return;
        let message: string = log.message;
        let channel = My.config[`${log.port}`].channels[log.type];
        if (channel == undefined) return;
        if (message.length > this.MAX_SYMBOLS) {
            let messages = await this.cutMessage(message, Math.round(message.length / this.MAX_SYMBOLS));
            for (let k in messages) {
                this.sendLogMessage(log.port, messages[k], channel);
            }
        } else {
            this.sendLogMessage(log.port, message, channel);
        }
    }
    private static async sendLogMessage(port: number, message: string, id: string): Promise<void> {
        ((My.clients[port] as Client).channels.resolve(id) as TextChannel).send(message);
    }
    private static async cutMessage(message: string, MAX: number): Promise<string[]> {
        let strings: string[];
        for (var a = 0, c = message.length; a < c && !(a >= c / 2 && " " == message[a]); a++);
        strings[0] = message.substring(0, a);
        getStrings();
        function getStrings() {
            for (let i = 0; i <= MAX - 1; i++) {
                if (message.substring(a + i) != undefined) {
                    strings[strings.length] = message.substring(a + i);
                }
            }
        }
        return strings;
    }
    private static cl(port: number | string): Client{
        return My.clients[+port] as Client;
    }
    private static async updateEmbeds(): Promise<void> {
        let embeds: MessageEmbed[];
        for (let port in My.config) {
            if (port.length < 10 && My.clients[port] && My.servers[port] != undefined) {
                let embed = new MessageEmbed();
                embed.setTitle(this.cl(port).user.username);
                embed.setAuthor(My.config[port].ipType ? My.config[port].ipType : `cyfhen.tk:${port}`);
                let server: IMyRequest = My.servers[port];
                embed.setColor(server.online > 0 ? "GREEN" : "DARK_ORANGE");
                embed.addField("Online:", server.online.toString(), true);
                //
                if (server.serverType == "MC") {
                    let data = server.data as IMyMcData;
                    embed.addFields(
                        { name: 'Запуск сервера:', value:`<t:${data.uptime}:R>`, inline: true },
                        { name: `TPS`, value: data.tps.toString(), inline: true}
                    );
                }else if(server.serverType == "SCP"){
                    let data = server.data as IMyScpData;
                    if(!data.roundRunning){
                        embed.setColor("YELLOW");
                    }else{
                        embed.addFields(
                            {name: "uptime:", value: `<t:${data.uptime}:R>`, inline: true},
                            {name: "Админов:", value: data.admins.toString(), inline: true},
                            {name: "Живых игроков: ", value: data.alivePlayers.toString(), inline: true},
                            {name: "Боеголовка активна:", value: `${data.warheadIsActive}`, inline: true},
                            {name: "LCZ CONT:", value: `${data.lczContaimented}`, inline: true},
                            {name: "Убийств:", value: data.kills.toString(), inline: true},
                            {name: "Открытых дверей:", value: data.openedDoors.toString(), inline: true},
                            {name: "Использованных аптечек:", value: data.usedMedKit.toString(), inline: true},
                        );
                    }
                }
                //
                embeds[embeds.length] = embed;
            }
        }
        if(embeds.length > 0){
            let resolve = await this.client.channels.resolve(My.config.sharedConfig.sharedServersEmbedsChannelId);
        if (resolve.isText()) {
            console.log(`channel found`)
            resolve.messages.fetch(My.config.sharedConfig.bot.messageId).then(x => { x.edit({ embeds }) });
        }
        }
    }

    private static updateStatus(): void {
        for (let k in My.config) {
            if (k.length < 10 && My.clients[k]) {
                (My.clients[k] as Client).user.setStatus(!My.servers[k] ? "dnd" : (My.servers[k] as IMyRequest).online == 0 ? "idle" : "online");
                let name = !My.servers[k] ? "0 игроков" : `${(My.servers[k] as IMyRequest).online} игроками`;
                (My.clients[k] as Client).user.setActivity({ type: "WATCHING", name });
            }
        }
    }
}