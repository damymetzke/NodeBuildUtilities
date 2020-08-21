import { fork, exec } from "child_process";
import * as path from "path";

const REGEX_NAMESPACE_SCRIPT = /^(\w+):([^ \n\t]+)$/;
const REGEX_ADD_EXTENSION = /^([^ \n\t]+?)(?:.js)?$/;

function parseScript(script: string): string
{
    return script
        .replace(REGEX_NAMESPACE_SCRIPT, (_match, namespace, scriptPath) => //parse namespaces
        {
            switch (namespace)
            {
                case "std":
                    return path.join(__dirname, "std", scriptPath);
                default:
                    return scriptPath;
            }
        })
        .replace(REGEX_ADD_EXTENSION, (_match, scriptPath) => `${scriptPath}.js`); //add js if it doesn't exist
}

export function runScriptSync(scriptPath: string, ...args: any[]): any
{
    const filePath = parseScript(scriptPath);

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
        const filePath = parseScript(scriptPath);

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