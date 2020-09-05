import * as stdLib from "./std/stdIndex";

import * as log from "./log";

import { LOGGER } from "./log";
import
{
    runScript, runScriptSync, runParallelScript,
    runNpm, ShellOptions, runShell, runBin,
    runBuildScript, runBuildScriptParallel
} from "./scriptLoader";
import
{
    bindScript, bindParallelScript,
    bindNpm, bindShell, bindBin,
    bindBuildScript, bindBuildScriptParallel
} from "./bind";
import { parse, clParsed } from "./clParser";

import { config } from "./config";


export
{
    stdLib,
    log,
    LOGGER,

    runScript,
    runScriptSync,
    runParallelScript,
    runNpm,
    ShellOptions,
    runShell,
    runBin,
    runBuildScript,
    runBuildScriptParallel,

    bindScript,
    bindParallelScript,
    bindNpm,
    bindShell,
    bindBin,
    bindBuildScript,
    bindBuildScriptParallel,

    parse,
    clParsed,
    config
};