import fs from "node:fs"
import readline from "node:readline"
import {
    Client as DiscordClient,
    Events as DiscordEvents,
    GatewayIntentBits as DiscordGatewayIntentBits
} from "discord.js"
import { MongoClient } from "mongodb"

const secretsFilePath = "./secrets.json"

interface Secrets {
    botToken: string
    mongoURI: string
}
let secrets: Secrets

let mongoClient: MongoClient
let discordClient: DiscordClient

main()

async function main() {
    await ResolveSecrets()
    await ConnectDatabase()
    await ConnectDiscord()
}

async function ResolveSecrets() {
    let rsecrets: Secrets
    secrets = {
        botToken: undefined,
        mongoURI: undefined
    }

    console.log("Attempting to read secrets file")
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

    console.log("Resolved secrets.")
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
        console.log("Connected to Discord")
    })

    discordClient.login(secrets.botToken)
}

function prompt(query): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise<string>((resolve) =>
        rl.question(query, (ans) => {
            rl.close()
            resolve(ans)
        })
    )
}
