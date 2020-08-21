import * as stdLib from "./std/stdIndex";

import * as log from "./log";

import { LOGGER } from "./log";
import { runScript, runScriptSync, runParallelScript, runNpm } from "./scriptLoader";
import { parse, clParsed } from "./clParser";


export
{
    stdLib,
    log,
    LOGGER,
    runScript,
    runScriptSync,
    runParallelScript,
    runNpm,
    parse,
    clParsed
};