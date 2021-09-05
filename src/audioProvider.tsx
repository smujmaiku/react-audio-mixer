
import React, { useEffect, useMemo } from 'react';
import useGestured from './hooks/gestured';

import {
	AudioProvider as Provider,
	AudioContextI
} from './audioContext';

interface AudioProviderPropsBase {
	children?: React.ReactNode;
	context?: void;
	latencyHint?: void;
	sampleRate?: void;
}

interface AudioProviderPropsWithContext extends Omit<AudioProviderPropsBase, 'context'> {
	context: AudioContext;
}

interface AudioProviderPropsWithHints extends Omit<AudioProviderPropsBase, 'latencyHint' | 'sampleRate'> {
	latencyHint?: number;
	sampleRate?: number;
}

export type AudioProviderProps = AudioProviderPropsWithContext | AudioProviderPropsWithHints;

export default function AudioProvider(props: AudioProviderProps): JSX.Element {
	const {
		children,
		context: rootContext,
		latencyHint = 0,
		sampleRate = 44100,
	} = props;

	const ready = useGestured();
	const context = useMemo(() => {
		if (rootContext) return rootContext;
		return new AudioContext({ latencyHint, sampleRate });
	}, [rootContext, latencyHint, sampleRate]);

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
