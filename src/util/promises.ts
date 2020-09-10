/**
 * takes a promise and turns the resolve state into a boolean.
 * 
 * @returns true if the promise resolves, false if the promise rejects.
 */
export function promiseResolves(promise: Promise<any>): Promise<boolean>
{
    return new Promise<boolean>((resolve) =>
    {
        promise
            .then(() =>
            {
                resolve(true);
            })
            .catch(() =>
            {
                resolve(false);
            });
    });
}

/**
 * just resolves the promise, but uses a default value in case of a rejection.
 * 
 * @param defaultValue used if promise rejects
 */
export async function promiseResolveOrDefault<T>(promise: Promise<T>, defaultValue: T): Promise<T>
{
    try
    {
        return await promise;
    }
    catch
    {
        return defaultValue;
    }
} 