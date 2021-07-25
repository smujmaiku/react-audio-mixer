import React, { useCallback } from 'react';
import useAudio, { FFT_MAX } from '../audioContext';
import AnalyserNode from './Analyser';

export type FftGroupT = [fft: number, volumn: number, jitter: number];

const REDUCEFFTS_THRESHOLD = 0.04;	// About half a semitone

export function joinFftGroups(list: FftGroupT[]): FftGroupT {
	return list.reduce((a, b) => {
		const [afft, avolume, ajitter] = a;
		const [bfft, bvolume, bjitter] = b;
		const sum = avolume + bvolume;
		return [
			(afft * avolume + bfft * bvolume) / sum || 0,
			sum,
			ajitter + bjitter,
		];
	}, [0, 0, 0] as FftGroupT)
}

export function reduceFfts(ffts: Uint8Array, limit = 50, threshold = REDUCEFFTS_THRESHOLD): FftGroupT[] {
	const groups: FftGroupT[] = [];
	let lastFft = 0;
	let newGroup = true;

	for (const [fftStr, volume] of Object.entries(ffts)) {
		const fft = parseInt(fftStr, 10);
		if (!(fft >= 0)) continue;

		if (volume < limit) {
			newGroup ||= 1 - lastFft / fft > threshold;
			continue;
		}

		if (newGroup) {
			groups.push([0, 0, 0]);
		}

		groups.push(joinFftGroups([
			groups.pop() || [0, 0, 0],
			[fft, volume / fft || 0, 1],
		]))

		lastFft = fft;
		newGroup = false;
	}

	return groups.map(([fft, volume, jitter]) => ([fft, fft * volume, jitter]));
}

export interface HzAnalyserProps {
	name: string;
	connect?: string[] | string;
	fftSize?: number;
	interval?: number;
	min?: number;
	max?: number;
	onUpdate: (list: FftGroupT[]) => void;
	onError?: (error: Error) => void;
}

export default function HzAnalyser(props: HzAnalyserProps): JSX.Element | null {
	const {
		name,
		connect,
		fftSize = FFT_MAX,
		interval = 500,
		min = -100,
		max = 0,
		onUpdate,
		onError,
	} = props;
	const { context } = useAudio();

	const handleUpdate = useCallback((buffer) => {
		const { sampleRate } = context;
		const mag = sampleRate / fftSize;

		const fftGroups = reduceFfts(buffer);
		const hzs = fftGroups.map(([fft, gain, jitter]) => ([fft * mag, gain, jitter] as FftGroupT));
		onUpdate(hzs);
	}, [context, fftSize, onUpdate]);

	return <AnalyserNode
		name={name}
		connect={connect}
		fftSize={fftSize}
		type="frequency"
		interval={interval}
		min={min}
		max={max}
		onUpdate={handleUpdate}
		onError={onError}
	/>;
}
