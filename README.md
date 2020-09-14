![ESLint](https://github.com/damymetzke/node-build-util/workflows/ESLint/badge.svg)

# Node-Build-Util
node-build-util is a package containing useful utilities to simplify custom build scripts.
The primary purpose is to move the build responsibility away from npm and into javascript.
>*node-build-util is currently in early development and as such the API can change drastically during the 0.X releases*

## Install
run `npm i --save-dev node-build-util`

## Quick Example
```js
//buildscript.config.js
const buildUtil = require("node-build-util");

module.exports = {
    buildScripts: {
        run: async () => {
            await buildUtil.runParallelScript("buildApp");
            buildUtil.runParallelScript("runApp");
        },
        test: async () => {
            await buildUtil.runParallelScript("buildTest");
            buildUtil.runParallelScript("testApp");
        },
        package: async () => {
            appBuild = buildUtil.runParallelScript("buildApp");
            await buildUtil.runParallelScript("buildTest");
            await buildUtil.runParallelScript("testApp");
            await appBuild;

            buildUtil.runParallelScript("package");
        }
    }
}
```

## Usage
To use node-build-util start by adding a `buildscript.config.js` file to the root of your project.
The content of this file should look something like this:
```js
module.exports = {
    buildScripts: {
        scriptName: () => { //scriptName is the name used to call this script 
            // write your implementation here
        }
    }
}
```
To run a custom script simply run the command: `b-script script`, this will try to find `script` in `buildscript.config.js`.
The command will fail if the script does not exist.
`b-script` is located in `node/modules/.bin`, but it is recommended to wrap all scripts using npm in `package.json`:
```json
{
    scripts: {
       "scriptName": "b-script scriptName"
    }
}
```

## Scripts
Scripts (which are distinct from **build scripts**) are scripts that are not defined in `buildscript.config.js`.
These scripts are not called using `b-script`, and as such are always called programatically.
In general there are 2 reasons to do this:
* The script should be run in parallel.
* The script is used more than once, but never called directly.

A script is a standard js file with one mandatory export: `scriptMain`.
`scriptMain` is a function which is considered the entry point of the script.
`scriptMain` can have arbitrary parameters and a return value.
*Returning a promise can sometimes unwrap the promise depending on the implementation*, because of this async is supported and the recommended method if the script contains asynchronous operations.

## Running scripts

### `runScript`
runScript will run a script based on a given path.
This simply runs the script.
This will return a promise that will resolve whenever the script is completed.
`runScriptSync` can be used to avoid the promise, *however this will not behave differently if the script returns a promise*.
Since it is encouraged to return promises from scripts whenever it makes sense `runScriptSync` should be avoided.

It is highly recommended to call `scriptMain` directly instead of using `runScript`.
Not only because of the increased performance, but also because it will contain the type information of the function.

```ts
    type runScript = (scriptPath: string, ...args any[])=>Promise<any>
    type runScriptSync = (scriptPath: string, ...args any[])=>any //return type could still be a promise

    //example usage
    const numFiles = await runScript("std:fileSystem:copyFolder.js", "src", "build/src");
```

### `runParallelScript`
This is identical to `runScript` in interface, but instead of running it in this process it starts a new node instance.
This will parallelize the script, resulting in a performance boost on larger projects.

```ts
    type runParallelScript = (scriptPath: string, ...args any[])=>Promise<any>

    //example usage
    const numFiles = _.sum(await Promise.all([
        runScript("std:fileSystem:copyFolder.js", "src", "build/src"),
        runScript("std:fileSystem:copyFolder.js", "html", "build"),
        runScript("std:fileSystem:copyFolder.js", "resources", "build", {subFolder: "res"})
        ]));
```

### `runNpm`
This will run an npm script. *while this is discouraged*, since this package is meant to move the responsability away from npm, this may be used when converting an existing project.

The first parameter is the script name, and the second is the optional npm root (the folder containing `package.json`).
The npm root should be the cwd, so if you have to pass the npmRoot there is probably something wrong with your setup.

## Standard Library
The package also contains a number of scripts for common operations.
These are defined as scripts with a scriptMain, and as such can be parallelized.
When using a standard script as input rather than finding the file itself it is recommended to use namespace notation.
For the standard library simply start the script with `std:`, this will automatically resolve to the correct folder.

All standard library scripts are also exported under `"node-build-util".stdLib`.
This way it is possible to import the scripts, which will reduce unnescesary overhead and includes type information in cases where parallelization is not desired.
