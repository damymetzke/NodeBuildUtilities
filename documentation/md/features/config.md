---
title: Feature - Config
---
[*index*](../index.md "index")/[*features*](./index.md "features")

# Config

Config is a system used to store config information in `YAML` or `JSON` files.
It allows for the easy reading and writing of configuration files.

### Sources

|Type |Name  |File            |
|-----|------|----------------|
|Class|Config|Config/config.ts|

## [Class]: Config

Purpose:

- Provide a link between config file and JavaScript.
- Allow access to config variables.

Quick example:
```ts
    const pathToFile = 'path/to/file.yaml' // Has to be json or yaml file.
    const config = new Config(pathToFile);

    config.load(); // Load from disk.

    const a = config.get('a'); // Type of value defaults to 'unknown'.
    const b = config.get<string>('b'); // Use generics to define the type.
    let c: string = config.get('c'); // Or set the type in the declaration.
    let d_a: string = config.get('d.a'); // Access nested objects using dots.
    let d_b_a: string = config.get('d.b.a'); // Use as many nested objects as desired.
    let d_c_24: string = config.get('d.c[24]'); // Array access is also supported, but adviced against.

    config.set('e', 400); // Set key ('e') to value (400).
    config.set<number>('f', 500); // Type value generic, and inferred by default.
    config.set('g.a.a[3]', 600); // The same nesting from the getter is supported.

    config.save(); // Save changed config to disk.

    const readConfig = new Config(pathToFile, true); // Open in readonly mode.

    readConfig.load();

    const readA = readConfig.get('a');
    readConfig.set('e', 400); // INCORRECT: readonly config can not be written to.

    readConfig.save(); // INCORRECT: readonly config can never be written to disk.
```

### [Function] constructor

```ts
    constructor(filePath: string, readOnly = false);
```

### [Function] load

Load config from disk.
File has been specified in constructor.

```ts
    load(): Promise<void>;
```

### [Function] save

Save config to disk.
File has been specified in constructor.
Will *not* work if config is set to read-only.

```ts
    save(): Promise<void>;
```

### [Function] get

Get config variable by key.
Access nested objects uaing dots `.`.
Example: `a.b.c`.
Access arrays as such: `a[0]` (not recommended).

```ts
    get<T = unknown>(key: string): T;
```

### [Function] set

Set config variables by key.
Access nested objects uaing dots `.`.
Example: `a.b.c`.
Access arrays as such: `a[0]` (not recommended).
Will *not* work if config is set to read-only.

```ts
    set<T>(key: string, value: T): void;
```
