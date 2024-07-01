import fs from "fs"
import readline from "readline"
import mongo, { MongoClient } from "mongodb"

const secretsFilePath = "./secrets.json"
let secrets;
let mongoClient: MongoClient

main()

async function main() {
    await ResolveSecrets()
    await ConnectDatabase()
}

async function ResolveSecrets() {
    let rsecrets
    secrets = {}

    console.log("Attempting to read secrets file")
    if (fs.existsSync(secretsFilePath)) {
        const read = fs.readFileSync(secretsFilePath, 'utf-8')
        rsecrets = JSON.parse(read)
        secrets = rsecrets
    }
    
    if (secrets.botToken == undefined) {
        secrets.botToken = await prompt("Enter discord bot token: ")
    }

    if (secrets.mongoURI == undefined) {
        secrets.mongoURI = await prompt("Enter mongo URI: ")
    }

    if (secrets != rsecrets) {
        fs.writeFileSync(secretsFilePath, JSON.stringify(secrets))
    }

    console.log("Resolved secrets.")
}

async function ConnectDatabase() {
    mongoClient = new MongoClient(secrets.mongoURI)
    await mongoClient.connect();
}

function prompt(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans)
    }))
}