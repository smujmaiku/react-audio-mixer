/*!
 * React Audio Hooks <https://github.com/smujmaiku/react-audio-mixer>
 * Copyright(c) 2021 Michael Szmadzinski
 * MIT Licensed
 */

import useAudio from './audioContext';

export default useAudio;
export { FFT_MIN, FFT_MID, FFT_MAX, BaseNodeProps, CustomNode } from './audioContext';
export { default as AudioProvider, AudioProviderProps } from './audioProvider';

export { default as GroupNode, GroupNodeProps } from './nodes/Group';
export { default as MicrophoneNode, MicrophoneNodeProps } from './nodes/Microphone';
export { default as StreamInNode, StreamInNodeProps } from './nodes/StreamIn';
export { default as OscillatorNode, OscillatorNodeProps } from './nodes/Oscillator';
export { default as NullNode, NullNodeProps } from './nodes/Null';
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
export { default as useNodeLink } from './hooks/nodeLink';
