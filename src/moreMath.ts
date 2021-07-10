/*!
 * More Math JS <https://github.com/smujmaiku/moremath-js>
 * Copyright(c) 2016 Michael Szmadzinski
 * MIT Licensed
 */

export type AverageWithWeightT = [value: number, weight: number];
export type AverageWithWeightReducerT = (value: AverageWithWeightT) => AverageWithWeightT;
export function averageWithWeight(list: AverageWithWeightT[], reducer?: AverageWithWeightReducerT): [average: number, sum: number] {
	const array = reducer ? list.map(reducer) : list;
	const sum = array.reduce((t, [v, w]) => t + v * w, 0);
	const count = array.reduce((t, [, w]) => t + w, 0);
	return [sum / count, sum];
}

export type GroupNeighborsReducerT<T> = (value: T) => number;
export function groupNeighbors(list: number[], limit: number, reducer?: GroupNeighborsReducerT<number>): number[][];
export function groupNeighbors<T>(list: T[], limit: number, reducer: GroupNeighborsReducerT<T>): T[][];
export function groupNeighbors<T>(list: T[], limit = 1, reducer: GroupNeighborsReducerT<T> = (v: unknown) => v as number): T[][] {
	const groups: T[][] = [];

	for (const value of list) {
		if (groups.length < 1) {
			groups.push([value]);
			continue;
		}

		const previous = groups[0][0];
		const diff = reducer(value) - reducer(previous);
		const newGroup = Math.abs(diff) <= limit;

		if (newGroup) {
			groups.push([]);
		}

		const group = groups.slice(-1)[0];
		group.push(value);
	}

	return groups;
}
