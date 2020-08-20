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