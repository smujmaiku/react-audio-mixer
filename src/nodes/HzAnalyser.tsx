import React, { useCallback } from 'react';
import useAudio, { FFT_MAX } from '../audioContext';
import AnalyserNode from './Analyser';

export type FftGroupT = [fft: number, volume: number, jitter: number];

const REDUCEFFTS_PADDING = 0.04;	// About half a semitone

export function joinFftGroups(list: FftGroupT[]): FftGroupT {
	return list.reduce((a, b) => {
		const [afft, avolume, ajitter] = a;
		const [bfft, bvolume, bjitter] = b;
		const sum = avolume + bvolume;
		return [
			sum ? (afft * avolume + bfft * bvolume) / sum : 0,
			sum,
			ajitter + bjitter,
		];
	}, [0, 0, 0] as FftGroupT)
}

export function reduceFfts(ffts: Uint8Array, padding = REDUCEFFTS_PADDING, limit = 0): FftGroupT[] {
	const groups: FftGroupT[] = [];
	let lastFft = 0;
	let newGroup = true;

	for (const [fftStr, volume] of Object.entries(ffts)) {
		const fft = parseInt(fftStr, 10);
		if (!(fft >= 0)) continue;

		if (volume <= limit) {
			newGroup ||= 1 - lastFft / fft > padding;
			continue;
		}

		if (newGroup) {
			groups.push([0, 0, 0]);
		}

		const weightedVolume = volume / (fft + 1);
		groups.push(joinFftGroups([
			groups.pop() || [0, 0, 0],
			[fft, weightedVolume, 1],
		]))

		lastFft = fft;
		newGroup = false;
	}

	return groups.map(([fft, volume, jitter]) => ([fft, fft * volume, jitter]));
}

export interface HzAnalyserProps {
	name: string;
	connect?: string[] | string;
	smoothing?: number;
	fftSize?: number;
	interval?: number;
	padding?: number;
	limit?: number;
	min?: number;
	max?: number;
	onUpdate: (list: FftGroupT[]) => void;
	onError?: (error: Error) => void;
}

export default function HzAnalyser(props: HzAnalyserProps): JSX.Element | null {
	const {
		name,
		connect,
		smoothing = 0,
		fftSize = FFT_MAX,
		interval = 500,
		padding = REDUCEFFTS_PADDING,
		limit = 0,
		min = -100,
		max = 0,
		onUpdate,
		onError,
	} = props;
	const { context } = useAudio();

	const handleUpdate = useCallback((buffer) => {
		const { sampleRate } = context;
		const mag = sampleRate / fftSize;

		const fftGroups = reduceFfts(buffer, padding, limit);
		const hzs = fftGroups.map(([fft, gain, jitter]) => ([fft * mag, gain, jitter] as FftGroupT));
		onUpdate(hzs);
	}, [context, fftSize, limit, padding, onUpdate]);

	return <AnalyserNode
		name={name}
		smoothing={smoothing}
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
