import fs from "fs"
import readline from "readline"

const secretsFilePath = "./secrets.json"
let secrets;

main()

async function main() {
    await ResolveSecrets()
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