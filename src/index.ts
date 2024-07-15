import fs from "node:fs"
import {
    Client as DiscordClient,
    Events as DiscordEvents,
    GatewayIntentBits as DiscordGatewayIntentBits
} from "discord.js"
import { MongoClient } from "mongodb"

import { Logger } from "./logger"

const secretsFilePath = "./secrets.json"

interface Secrets {
    botToken: string
    mongoURI: string
}
let secrets: Secrets

let mongoClient: MongoClient
let discordClient: DiscordClient
let logger: Logger

main()

async function main() {
    await AttachLogger()
    await ResolveSecrets()
    await ConnectDatabase()
    await ConnectDiscord()
}

async function AttachLogger() {
    //TODO: After config is available, get logger configs and actually make this function important

    logger = new Logger("./log.log")
}

async function ResolveSecrets() {
    let rsecrets: Secrets
    secrets = {
        botToken: undefined,
        mongoURI: undefined
    }

    logger.Log("Attempting to read secrets file")
    if (fs.existsSync(secretsFilePath)) {
        const read = fs.readFileSync(secretsFilePath, "utf-8")
        rsecrets = JSON.parse(read)
        secrets = { ...rsecrets }
    }

    if (secrets.botToken === undefined) {
        secrets.botToken = await prompt("Enter discord bot token: ")
    }

    if (secrets.mongoURI === undefined) {
        secrets.mongoURI = await prompt("Enter mongo URI: ")
    }

    if (secrets !== rsecrets) {
        fs.writeFileSync(secretsFilePath, JSON.stringify(secrets))
    }

    logger.Log("Resolved secrets.")
}

async function ConnectDatabase() {
    mongoClient = new MongoClient(secrets.mongoURI)
    await mongoClient.connect()
}

async function ConnectDiscord() {
    discordClient = new DiscordClient({
        intents: [DiscordGatewayIntentBits.Guilds]
    })

    discordClient.once(DiscordEvents.ClientReady, (r) => {
        logger.Log("Connected to Discord")
    })

    discordClient.login(secrets.botToken)
}

async function prompt(query): Promise<string> {
    console.log(query)

    const stdin = process.stdin
    stdin.setEncoding("utf-8")

    return new Promise<string>((resolve) => {
        stdin.resume()
        stdin.once("data", (data) => {
            const chunk = data.toString().trim()
            resolve(chunk)
        })
    })
}
