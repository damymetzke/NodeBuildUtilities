import { LOGGER } from "./log";

if (!process.send)
{
    LOGGER.error("process is not a valid child_process");
    process.exit(1);
}

process.once("message", (data: { scriptPath: string; args: any[]; }) =>
{
    const { scriptPath, args } = data;
    const script = require(scriptPath);
    const mainExists = (typeof script.scriptMain === "function");

    if (args.length > 0 && !mainExists)
    {
        if (process.send)
        {
            process.send({
                type: "reject",
                message: "arguments passed but no scriptMain defined"
            });
        }
        return;
    }

    if (!mainExists)
    {
        if (process.send)
        {
            process.send({
                type: "resolve",
                result: undefined
            });
        }
        return;
    }

    const result = script.scriptMain(...args);
    if (process.send)
    {
        process.send({
            type: "resolve",
            result: result
        });
    }
});