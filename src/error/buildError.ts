export interface IDefaultSerializedError{
    message: string;
}

export interface ISerializedError<T = IDefaultSerializedError>
{
    type: string;
    error: T;
}

export class BuildError extends Error
{
    constructor(message: string, type: string = 'build-error')
    {
        super(message);
        this.name = type;
    }

    serialize(): ISerializedError
    {
        return {
            type: this.name,
            error: {
                message: this.message
            }
        }
    }
}