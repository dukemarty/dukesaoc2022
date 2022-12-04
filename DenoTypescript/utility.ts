
export const isEmptyString = (data: string): boolean => typeof data === "string" && data.trim().length == 0;

export const isLowercase = (data: string): boolean => data.toLowerCase() === data;

export const chr = (data: string): number => data.charCodeAt(0);

export function partitionArray<T>(data: Array<T>, groupSize: number): Array<Array<T>> {
    return Array.from(Array(data.length / groupSize).keys()).map( (i) => data.slice(i*groupSize, (i+1)*groupSize));
}

export function intersectSets<T>(l: Set<T>, r: Set<T>): Set<T>{
    return new Set(Array.from(l.values()).filter( (i) => r.has(i) ));
}