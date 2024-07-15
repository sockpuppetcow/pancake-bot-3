import fs from "node:fs"

export enum LogLevel {
    Normal,
    Debug,
    Warn,
    Error
}

export class Logger {
    logfile: string
    constructor(filepath: string) {
        this.logfile = filepath
    }

    Log(
        data: string,
        logLevel = LogLevel.Normal,
        logToConsole = true,
        logToFile = true
    ) {
        let pre = `[${Date.now()}]`

        switch (logLevel) {
            case LogLevel.Normal: {
                break
            }
            case LogLevel.Debug: {
                pre += "[DEBUG]"
                break
            }
            case LogLevel.Warn: {
                pre += "[WARN]"
                break
            }
            case LogLevel.Error: {
                pre += "[ERROR]"
            }
        }

        const out = `${pre} ${data} \n`

        if (logToConsole) {
            console.log(out)
        }

        if (logToFile) {
            fs.appendFileSync(this.logfile, out)
        }
    }
}
