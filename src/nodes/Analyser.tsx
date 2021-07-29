import React, { useEffect, useMemo } from 'react';
import useAudio, { CustomNode, FFT_MIN } from '../audioContext';

export interface AnalyserNodePropsBase {
	name: string;
	connect?: string[] | string;
	type: 'frequency' | 'waveform';
	fftSize?: number;
	interval?: number;
	smoothing?: number;
	min?: number;
	max?: number;
	onError?: (error: Error) => void;
}

interface AnalyserNodePropsByByte extends AnalyserNodePropsBase {
	onUpdate: (data: Uint8Array) => void;
	floatBuffer?: false;
}
interface AnalyserNodePropsByFloat extends AnalyserNodePropsBase {
	onUpdate: (data: Float32Array) => void;
	floatBuffer: true;
}

type AnalyserNodeProps = AnalyserNodePropsByByte | AnalyserNodePropsByFloat;

export default function AnalyserNode(props: AnalyserNodeProps): JSX.Element | null {
	const {
		name,
		connect,
		type,
		fftSize = FFT_MIN,
		interval = 500,
		smoothing = 0,
		min = -100,
		max = 0,
		floatBuffer = false,
		onUpdate,
		onError,
	} = props;
	const { context, ready } = useAudio();

	const node = useMemo(() => {
		try {
			return context.createAnalyser();
		} catch (e) { }
	}, [context]);

	useEffect(() => {
		if (!node) return;
		node.smoothingTimeConstant = smoothing;
	}, [node, smoothing]);

	useEffect(() => {
		if (!node) return;
		node.minDecibels = min;
		node.maxDecibels = max;
	}, [node, min, max]);

	useEffect(() => {
		if (!node || !ready) return;
		node.fftSize = fftSize;

		const buffer = floatBuffer ?
			new Float32Array(node.frequencyBinCount) :
			new Uint8Array(node.frequencyBinCount)

		const update = () => {
			if (type === 'frequency') {
				if (buffer instanceof Uint8Array) {
					node.getByteFrequencyData(buffer);
				} else if (buffer instanceof Float32Array) {
					node.getFloatFrequencyData(buffer);
				}
			} else if (type === 'waveform') {
				if (buffer instanceof Uint8Array) {
					node.getByteTimeDomainData(buffer);
				} else if (buffer instanceof Float32Array) {
					node.getFloatTimeDomainData(buffer);
				}
			}
			onUpdate(buffer as never);
		};

		const timer = setInterval(update, interval);

		return () => {
			clearInterval(timer);
		};
	}, [node, ready, type, floatBuffer, interval, fftSize, onUpdate]);

	if (!node) return null;

	return (
		<CustomNode
			name={name}
			connect={connect}
			type="output"
			node={node}
			onError={onError}
		/>
	);
}
