import * as log from "./log";

import { LOGGER } from "./log";
import { runScript, runScriptSync, runParallelScript, runNpm } from "./scriptLoader";
import { parse, clParsed } from "./clParser";

export
{
    log,
    LOGGER,
    runScript,
    runScriptSync,
    runParallelScript,
    runNpm,
    parse,
    clParsed
};