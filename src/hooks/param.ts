import { useEffect } from 'react';

export type AudioParamSetValue = [
	type: 'setValue',
	value: number,
	startTime: number
];
export type AudioParamLinearRamp = [
	type: 'linearRamp',
	value: number,
	endTime: number
];
export type AudioParamExponentialRamp = [
	type: 'exponentialRamp',
	value: number,
	endTime: number
];
export type AudioParamSetTarget = [
	type: 'setTarget',
	target: number,
	startTime: number,
	timeConstant: number
];
export type AudioParamSetValueCurve = [
	type: 'setValueCurve',
	values: number[] | Float32Array,
	startTime: number,
	duration: number
];

export type AudioParamT =
	| AudioParamSetValue
	| AudioParamLinearRamp
	| AudioParamExponentialRamp
	| AudioParamSetTarget
	| AudioParamSetValueCurve;
export type AudioParamSequence = AudioParamT[];

export function scheduleValues(
	param: AudioParam,
	sequence: AudioParamSequence
): void {
	for (const command of sequence) {
		switch (command[0]) {
			case 'setValue':
				param.setValueAtTime(command[1], command[2]);
				break;
			case 'linearRamp':
				param.linearRampToValueAtTime(command[1], command[2]);
				break;
			case 'exponentialRamp':
				param.exponentialRampToValueAtTime(command[1], command[2]);
				break;
			case 'setTarget':
				param.setTargetAtTime(command[1], command[2], command[3]);
				break;
			case 'setValueCurve':
				param.setValueCurveAtTime(command[1], command[2], command[3]);
				break;
			default:
		}
	}
}

export default function useParam(
	param: AudioParam | undefined,
	value: number,
	sequence?: AudioParamSequence
): void {
	useEffect(() => {
		if (!param) return undefined!;
		// eslint-disable-next-line no-param-reassign
		param.value = value;

		if (sequence) {
			scheduleValues(param, sequence);
		}

		return () => {
			param.cancelScheduledValues(0);
		};
	}, [param, value, sequence]);
}
