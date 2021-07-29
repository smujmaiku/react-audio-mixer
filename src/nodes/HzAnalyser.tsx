import React, { useCallback } from 'react';
import useAudio, { FFT_MAX } from '../audioContext';
import AnalyserNode, { AnalyserNodePropsBase } from './Analyser';

export type AnalyserToneT = [value: number, volume: number, jitter: number];

const REDUCEFFTS_PADDING = 0.04;	// About half a semitone

export function joinToneGroups(list: AnalyserToneT[]): AnalyserToneT {
	return list.reduce((a, b) => {
		const [atone, avolume, ajitter] = a;
		const [btone, bvolume, bjitter] = b;
		const sum = avolume + bvolume;
		return [
			sum ? (atone * avolume + btone * bvolume) / sum : 0,
			sum,
			ajitter + bjitter,
		];
	}, [0, 0, 0] as AnalyserToneT)
}

export function reduceFfts(ffts: Uint8Array, padding = REDUCEFFTS_PADDING, limit = 0): AnalyserToneT[] {
	const groups: AnalyserToneT[] = [];
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
		groups.push(joinToneGroups([
			groups.pop() || [0, 0, 0],
			[fft, weightedVolume, 1],
		]))

		lastFft = fft;
		newGroup = false;
	}

	return groups.map(([fft, volume, jitter]) => ([fft, fft * volume, jitter]));
}

export interface HzAnalyserProps extends Omit<AnalyserNodePropsBase, 'type' | 'onUpdate'> {
	padding?: number;
	limit?: number;
	onUpdate: (list: AnalyserToneT[]) => void;
}

export default function HzAnalyser(props: HzAnalyserProps): JSX.Element | null {
	const {
		fftSize = FFT_MAX,
		padding = REDUCEFFTS_PADDING,
		limit = 0,
		onUpdate,
		onError,
		...analyserProps
	} = props;
	const { context } = useAudio();

	const handleUpdate = useCallback((buffer) => {
		const { sampleRate } = context;
		const mag = sampleRate / fftSize;

		const fftGroups = reduceFfts(buffer, padding, limit);
		const hzs = fftGroups.map(([fft, volume, jitter]) => ([fft * mag, volume, jitter] as AnalyserToneT));
		onUpdate(hzs as AnalyserToneT[]);
	}, [context, fftSize, limit, padding, onUpdate]);

	return <AnalyserNode
		fftSize={fftSize}
		type="frequency"
		onUpdate={handleUpdate}
		onError={onError}
		{...analyserProps}
	/>;
}
