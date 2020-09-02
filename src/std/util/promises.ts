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