import { fork, exec } from "child_process";
import * as path from "path";

const REGEX_EXTENSION_TEST = /.js$/;

export function runScriptSync(scriptPath: string, ...args: any[]): any
{
    const filePath = REGEX_EXTENSION_TEST.test(scriptPath)
        ? scriptPath
        : `${scriptPath}.js`;

    let scriptMain;
    try
    {
        scriptMain = require(filePath).scriptMain;
    }
    catch (error)
    {
        throw `Script ${filePath} not found`;
    }
    if (!scriptMain)
    {
        throw `Script ${filePath} does not define scriptMain`;
    }
    if (typeof scriptMain !== "function")
    {
        throw `Script ${filePath} defines scriptMain, but it is not a function`;
    }

    return scriptMain(...args);
}

export async function runScript(scriptPath: string, ...args: any[]): Promise<any>
{
    return runScriptSync(scriptPath, ...args);
}

export function runParallelScript(scriptPath: string, ...args: any[]): Promise<any>
{
    return new Promise<any>((resolve, reject) =>
    {
        const filePath = REGEX_EXTENSION_TEST.test(scriptPath)
            ? scriptPath
            : `${scriptPath}.js`;

        const child = fork(path.join(__dirname, "parallelScriptLoader.js"));

        child.on("message", (message: any) =>
        {
            switch (message.type)
            {
                case "reject":
                    reject(message.message);
                    break;
                case "resolve":
                    resolve(message.result);
                    break;
                default:
                    reject("invalid response from parallelScriptLoader");
            }
        });

        child.send({
            scriptPath: filePath,
            args: args
        });
    });
}

export function runNpm(scriptName: string, npmRoot?: string): Promise<void>
{
    return new Promise<void>((resolve, reject) =>
    {
        const cwd = npmRoot
            ? npmRoot
            : process.cwd();
        exec(`npm run ${scriptName}`, {
            cwd: cwd
        }, (error) =>
        {
            if (error)
            {
                reject(error);
            }
            resolve();
        });
    });
}