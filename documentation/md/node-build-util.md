[*index*](. "index")

# Node Build Util

Node Build Util is a *build utility* package.
It provides a set of utilities to aid in creating custom build systems.
It is meant for high-level operations.
Any complex or performance dependent code should not be written using this library.

## How to use NBU

NBU is meant for *high level build systems*.
It prioritizes simplicity and fast creation over performance and scalability.
Do **not** use NBU for complex or performance dependent build systems.

## Goals

- Simplify common and generic operations during building (loading and validating config files, logging to files, etc.).
- Supply scripts for specific actions (rendering markdown, linting, etc.).
- Make the process of creating a new project as fast and easy as possible.
- Fully support and encourage the use of promises + async/await.
- Stay as close to vanilla JavaScript/TypeScript as possible.

## Contains

- A custom logging system to control multiple channels, coloring and multiple outputs.
- Loading and validation of config files written in JSON or YAML.
- Parallel execution of scripts using multiple node instances.
- Custom error system capable of multiple conversions and serialization.
