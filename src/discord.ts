import { My } from "./My";
import { ActivityFlags, Client, Intents, Message, MessageEmbed, TextChannel } from 'discord.js';
import { IMyClient, IMyLog, IMyServer, IMyServerData, IMySlCustomServerData } from "./features";
const fs = require(`fs`)
export class Discord {
    static run() {
        this.turnObAllBots();
        setInterval(() => {try{this.updateStatus()}catch{}}, 10000);
    }
    private static baseClient: Client;
    private static turnObAllBots(): void {
        this.baseClient = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_PRESENCES", "GUILD_WEBHOOKS"] });
        this.baseClient.login(My.config.sharedConfig.bot.token);

        this.baseClient.on(`ready`, () => {
            console.log(this.baseClient.user.tag + " подключился")
            setInterval(() => {try{this.updateEmbeds()}catch{}}, 10000);
        });
        for (let k in My.config) {
            if (!isNaN(parseInt(k)) && My.config[k]?.inactive == false) {
                let client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_PRESENCES"] });
                My.clients.set(+k, { port: +k, client: client });
                client.login(My.config[k].token).then(x =>
                    console.log("Зашёл за " + client.user.tag));

            }
        }
    }
    public static MAX_SYMBOLS: number = 1990;
    public static async sendLog(port: number, log: IMyLog): Promise<void> {
        if (My.clients.get(port) == undefined) return;
        let message: string = log.content;
        let channel = My.config[port.toString()].channels[log.channel];
        if (channel == undefined) return;
        if (message.length > this.MAX_SYMBOLS) {
            let messages = await this.cutMessage(message, Math.round(message.length / this.MAX_SYMBOLS));
            for (let k in messages) {
                this.sendLogMessage(port, messages[k], channel);
            }
        } else {
            this.sendLogMessage(port, message, channel);
        }
    }
    private static async sendLogMessage(port: number, message: string, id: string): Promise<void> {
        (My.clients.get(port).client.channels.resolve(id) as TextChannel).send(message);
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
    private static async updateEmbeds(): Promise<void> {
        let destinations: IMyEmbedDestination[] = My.config["sharedConfig"].embeds as IMyEmbedDestination[];
        for (let destIndex in destinations) {
            let message = await Discord.GetEmbedMessage(destinations[destIndex]);
            if (message == undefined) {
                let channel = Discord.baseClient.guilds.resolve(destinations[destIndex].guild).channels.resolve(destinations[destIndex].channel) as TextChannel;
                channel.send({ embeds: [new MessageEmbed().setTitle("Init").setDescription("Wait please")] });
                setTimeout(() => {
                    (Discord.baseClient.guilds.resolve(destinations[destIndex].guild).channels.resolve(destinations[destIndex].channel) as TextChannel).messages.fetch().then(x => {
                        message = x.find(z => z.id == destinations[destIndex].message);
                        destinations[destIndex].message = (Discord.baseClient.guilds.resolve(destinations[destIndex].guild).channels.resolve(destinations[destIndex].channel) as TextChannel).messages.cache.lastKey()
                        My.config["sharedConfig"].embeds = destinations;
                        fs.writeFileSync(__dirname + "/../data/config.json", JSON.stringify(My.config, null, "\t"))
                        Discord.WorkWithMessage(destinations[destIndex]);
                    })
                }, 1000);
            } else {
                Discord.WorkWithMessage(destinations[destIndex]);
            }
        }
    }
    private static WorkWithMessage(destination: IMyEmbedDestination): void {
        (Discord.baseClient.guilds.resolve(destination.guild).channels.resolve(destination.channel) as TextChannel).messages.fetch().then(x => {
            let message = x.find(z => z.id == destination.message);
            let embeds: MessageEmbed[] = [];
            for (let k in My.config) {
                if (k.length < 10) {
                    let port = +k;
                    let server = My.servers.get(port);
                    let embed = new MessageEmbed()
                        .setTitle(My.clients.get(port).client.user.username)
                        .setColor(server == undefined ? "#370000" : this.ServerIsAlive(port) ? (server?.data?.online == 0 ? "#20B9D5" : server?.data?.online > 0 ? "#36D520" : "NOT_QUITE_BLACK") : "#6D2E00")
                        .setAuthor(My.config[port].ipType ? My.config[port].ipType : `celena.pw:${port}`, My.clients.get(port).client.user.avatarURL());
                    if (server == undefined) {
                        embed.setDescription("SERVER IS OFFLINE");
                    } else {
                        if (server.data == undefined) {
                            embed.setDescription("Initializing server's data");
                        } else if (server.customData == undefined || server.customData?.data == undefined) {
                            embed.setDescription("Initializing server's custom data");
                        } else {
                            console.log("a", server.customData, server.data)
                            embed.addField("Online:", server.data.online.toString(), true);
                            switch (My.servers.get(port).game) {
                                case "sl": {
                                    let customData = server.customData.data as IMySlCustomServerData;
                                    if (customData.round) {
                                        embed.addFields(
                                            { name: "Admins:", value: customData.perms.toString(), inline: true },
                                            { name: "Живых игроков: ", value: (server.data.online - customData.spectators).toString(), inline: true },
                                            { name: "Uptime:", value: `<t:${server.data.elapsed}:R>`, inline: true },
                                            { name: "Боеголовка активна:", value: `${Discord.BooleanTransform(customData.warhead)}`, inline: true },
                                            { name: "LCZ CONT:", value: `${Discord.BooleanTransform(customData.decontamination)}`, inline: true },
                                            { name: "Убийств:", value: customData.kills.toString(), inline: true }
                                        );
                                    } else {
                                        embed.setColor("YELLOW")
                                        embed.description = "Waiting for players";
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    embeds.push(embed);
                }
            }
            message.edit({ embeds });
        })
    }
    private static BooleanTransform = (condition: boolean) => condition ? "✅" : "🟥";
    private static async GetEmbedMessage(destination: IMyEmbedDestination): Promise<Message> {
        return new Promise((res) => {
            if (Discord.baseClient.guilds.resolve(destination.guild) == undefined) throw "Guild is denied";
            if (Discord.baseClient.guilds.resolve(destination.guild).channels.resolve(destination.channel) == undefined) throw "Channel is denied";
            (Discord.baseClient.guilds.resolve(destination.guild).channels.resolve(destination.channel) as TextChannel).messages.fetch().then(x => {
                res(x.find(z => z.id == destination.message));
            })
        })
    }
    private static updateStatus(): void {
        for (let k in My.config) {
            if (k.length < 10 && My.clients.has(+k)) {
                console.log(k)
                let client = My.clients.get(+k).client;
                if (My.servers.has(+k) && My.servers.get(+k).data && My.servers.get(+k).data.online != undefined && Discord.ServerIsAlive(+k)) {
                    let server = My.servers.get(+k);
                    console.log("oof")
                    client.user.setStatus(server.data.online == 0 ? "idle" : "online");
                    client.user.setActivity(`${server.data.online} players`);
                } else {
                    console.log("nope", My.servers.get(+k))
                    client.user.setStatus("dnd");
                    client.user.setActivity({ type: "LISTENING", name: "offline server" });
                }
            }

        }
    }
    private static ServerIsAlive(port: number): boolean {
        return My.servers.has(port) && My.servers.get(port).data != undefined && My.servers.get(port).data.online != undefined && (My.servers.get(port).lastSync + 16000 > Date.now())
    }
}

interface IMyEmbedDestination {
    guild: string,
    channel: string,
    message: string
}