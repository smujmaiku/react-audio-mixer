/*!
 * React Audio Hooks <https://github.com/smujmaiku/react-audio-mixer>
 * Copyright(c) 2021 Michael Szmadzinski
 * MIT Licensed
 */

import React, { useEffect, useMemo } from 'react';
import useGestured from './hooks/gestured';

import useAudio, {
	AudioProvider as Provider,
	AudioContextI
} from './audioContext';

export default useAudio;
export { FFT_MIN, FFT_MID, FFT_MAX, BaseNodeProps, CustomNode } from './audioContext';

export { default as MicrophoneNode, MicrophoneNodeProps } from './nodes/Microphone';
export { default as StreamInNode, StreamInNodeProps } from './nodes/StreamIn';
export { default as OscillatorNode, OscillatorNodeProps } from './nodes/Oscillator';
export { default as GainNode, GainNodeProps } from './nodes/Gain';
export { default as AnalyserNode, AnalyserNodeProps } from './nodes/Analyser';
export { default as HzAnalyserNode, HzAnalyserNodeProps } from './nodes/HzAnalyser';
export { default as NoteAnalyserNode, NoteAnalyserNodeProps } from './nodes/NoteAnalyser';
export { default as SpeakerNode, SpeakerNodeProps } from './nodes/Speaker';
export { default as StreamOutNode, StreamOutNodeProps } from './nodes/StreamOut';

export {
	default as useAudioDevices,
	useInputDevices,
	useOutputDevices,
} from './hooks/devices';
export { default as useGestured } from './hooks/gestured';
export { default as useParam } from './hooks/param';

export interface AudioProviderProps {
	children?: React.ReactNode;
	latencyHint?: number;
	sampleRate?: number;
}

export function AudioProvider(props: AudioProviderProps): JSX.Element {
	const {
		children,
		latencyHint = 0,
		sampleRate = 44100,
	} = props;

	const ready = useGestured();
	const context = useMemo(() => {
		return new AudioContext({ latencyHint, sampleRate });
	}, [latencyHint, sampleRate]);

	useEffect(() => {
		if (!ready) return;
		context.resume();
	}, [context, ready]);

	const value: AudioContextI = useMemo(() => ({
		context,
		ready,
	}), [context, ready]);

	return (
		<Provider value={value}>
			{children}
		</Provider>
	);
}
