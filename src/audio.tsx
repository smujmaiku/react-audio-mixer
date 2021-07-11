/*!
 * React Audio Hooks <https://github.com/smujmaiku/react-audio-mixer>
 * Copyright(c) 2021 Michael Szmadzinski
 * MIT Licensed
 */

import React, { useEffect, useMemo } from 'react';
import useGestured from './gestured';

import useAudio, {
	AudioProvider as Provider,
	AudioContextI
} from './audioContext';
export default useAudio;
export { CustomNode } from './audioContext';

export { default as MicrophoneNode } from './nodes/Microphone';
export { default as StreamInNode } from './nodes/StreamIn';
export { default as OscillatorNode } from './nodes/Oscillator';
export { default as GainNode } from './nodes/Gain';
export { default as AnalyserNode } from './nodes/Analyser';
export { default as SpeakerNode } from './nodes/Speaker';
export { default as StreamOutNode } from './nodes/StreamOut';

export {
	default as useAudioDevices,
	useInputDevices as useAudioInputDevices,
	useOutputDevices as useAudioOutputDevices,
} from './devices';

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
