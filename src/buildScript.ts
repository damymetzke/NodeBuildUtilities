import { LOGGER } from "./log";
import * as path from "path";
import { parse } from "./clParser";

const buildscriptfile = (() =>
{
    try
    {
        return require(path.join(process.cwd(), "buildscript.config.js"));
    }
    catch (error)
    {
        LOGGER.error("error loading buildscript.config.js:");
        LOGGER.error(error);
        process.exit(1);
    }
})();

const args = parse(process.argv.slice(2))
    .option("target", 1);

const [ script ] = args.positional;

if (!script)
{
    LOGGER.error("no script passed through cli");
    process.exit(1);
}

if (!("buildScripts" in buildscriptfile) || !(script in buildscriptfile.buildScripts))
{
    LOGGER.error(`script '${script}' not found!`);
    process.exit(1);
}

buildscriptfile.buildScripts[ script ]();