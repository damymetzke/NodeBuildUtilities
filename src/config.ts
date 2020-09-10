import { promises as fs } from "fs";
import { util} from "./index";
import { LOGGER } from "./log";
import * as _ from "lodash";

const {promiseResolveOrDefault} = util;

let configData: ConfigObject = {};

export type ConfigType =
    | ConfigObject
    | ConfigType[]
    | boolean
    | null
    | string
    | number;

type ConfigObject = { [ key: string ]: ConfigType; };

export class ConfigVariable<T extends ConfigType>
{
    under: { [ key: string ]: ConfigType; };
    key: string;
    defaultValue: T;

    constructor (under: { [ key: string ]: ConfigType; }, key: string, defaultValue: T)
    {
        this.under = under;
        this.key = key;
        this.defaultValue = defaultValue;
    }

    get(): Readonly<T>
    {
        if (!(this.key in this.under))
        {
            return this.defaultValue;
        }
        return <T>this.under[ this.key ];
    }
    set(value: T): void
    {
        this.under[ this.key ] = value;
    }
    delete(): void
    {
        delete this.under[ this.key ];
    }
    exists(): boolean
    {
        return (this.key in this.under);
    }
}

function fillConfig(source: ConfigObject, target: ConfigObject)
{
    for (const key in source)
    {
        if (typeof source[ key ] === "undefined")
        {
            //ignore undefined
            continue;
        }

        if (typeof source[ key ] !== "object" || Array.isArray(source[ key ]))
        {
            target[ key ] = _.cloneDeep(source[ key ]);
            continue;
        }


        if (typeof target[ key ] !== "object" || Array.isArray(target[ key ]))
        {
            //it doesn't exist, so clone everything at once.
            target[ key ] = _.cloneDeep(source[ key ]);
        }

        fillConfig(<ConfigObject>source[ key ], <ConfigObject>target[ key ]);
    }
}

export async function loadConfig(filePath: string)
{
    const data = await promiseResolveOrDefault(
        fs.readFile(filePath)
            .then(data => data.toString())
            .then(async (data) => JSON.parse(data)),
        {}
    );

    fillConfig(data, configData);
}

export async function saveConfig(filePath: string)
{
    await fs.writeFile(filePath, JSON.stringify(configData, null, 2));
}

function getValueBySteps(object: ConfigType, steps: string[]): [ ConfigObject, string ] | null
{
    if (steps.length < 1)
    {
        return null;
    }

    if (steps.length === 1)
    {
        return [
            <ConfigObject>object,
            steps[ 0 ]
        ];
    }

    const subObject = <ConfigObject>object;

    if (typeof subObject[ steps[ 0 ] ] === "undefined")
    {
        subObject[ steps[ 0 ] ] = {};
    }

    if (typeof subObject[ steps[ 0 ] ] !== "object" || Array.isArray(subObject[ steps[ 0 ] ]))
    {
        LOGGER.warning("Old config variable has been forcefully replaced."); //todo: think of a clearer variable.
        subObject[ steps[ 0 ] ] = {};
    }


    return getValueBySteps(subObject[ steps[ 0 ] ], steps.slice(1));
}

export function config<T extends ConfigType>(key: string, defaultValue: T): ConfigVariable<T>
{
    const steps = key.split(".");
    const objectKeyPair = getValueBySteps(configData, steps);
    if (objectKeyPair === null)
    {
        const message = `Config Error: key '${key}' invalid`;
        LOGGER.error(message);
        throw message;
    }

    const [ object, objectKey ] = objectKeyPair;
    return new ConfigVariable<T>(object, objectKey, defaultValue);
}