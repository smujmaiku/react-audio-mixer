import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import makeListProvider from 'make-list-provider';

export const FFT_MIN = 32;
export const FFT_MID = 8192;
export const FFT_MAX = 32768;

export type NodeTypeT = 'input' | 'node' | 'output';
export interface NodeI {
	name: string;
	node: AudioNode;
	type: NodeTypeT;
}

const [NodeProvider, useNode, useNodes] = makeListProvider<NodeI>();

export interface AudioContextI {
	context: AudioContext;
	ready: boolean;
}

const context = createContext<AudioContextI | undefined>(undefined);

export default function useAudio(): AudioContextI {
	return useContext(context) as AudioContextI;
}

export interface AudioProviderProps {
	children?: React.ReactNode;
	value: AudioContextI;
	onNodes?: (state: NodeI[]) => void;
}

export function AudioProvider(props: AudioProviderProps): JSX.Element {
	const { value, onNodes, children } = props;
	return (
		<NodeProvider onChange={onNodes}>
			<context.Provider value={value}>
				{children}
			</context.Provider>
		</NodeProvider>
	);
}

export function useAudioNode(name: string): NodeI {
	const list = useNodes();
	return list.filter((node) => node.name === name)[0];
}

interface ListenLinkProps {
	linkId: string;
	node: AudioNode;
	onError?: (error: Error) => void;
}

function ListenLink(props: ListenLinkProps) {
	const { linkId, node, onError } = props;

	const link = useAudioNode(linkId)?.node;
	const onErrorRef = useRef<(error: Error) => void>();
	onErrorRef.current = onError;

	useEffect(() => {
		if (!link || !node) return () => { return; };

		try {
			link.connect(node);
		} catch (error) {
			if (onErrorRef.current) {
				onErrorRef.current(error);
			}
		}

		return () => {
			try {
				link.disconnect(node);
			} catch (e) { }
		};
	}, [link, node, onErrorRef]);
	return null;
}

export interface BaseNodeProps {
	name: string;
	listen?: string[] | string;
	onError?: (error: Error) => void;
}

export type BaseInNodeProps = Omit<BaseNodeProps, 'listen'>;
export type BaseOutNodeProps = BaseNodeProps;

export interface CustomNodeProps extends BaseNodeProps {
	type: NodeTypeT;
	node: AudioNode;
}

export function CustomNode(props: CustomNodeProps): JSX.Element {
	const { name, listen, type, node, onError } = props;

	const state = useMemo(() => ({ name, type, node }), [name, type, node]);
	useNode(state);

	const listeners = useMemo(() => {
		if (listen instanceof Array) return listen;
		if (typeof listen === 'string') return [listen];
		return [];
	}, [listen]);

	return <>
		{listeners.map(linkId => (
			<ListenLink
				key={linkId}
				linkId={linkId}
				node={node}
				onError={onError}
			/>
		))}
	</>;
}

export const useAudioNodes = useNodes;
