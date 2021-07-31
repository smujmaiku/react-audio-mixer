import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import makeListProvider from 'make-list-provider';

export const FFT_MIN = 32;
export const FFT_MID = 8192;
export const FFT_MAX = 32768;

export type NodeTypeT = 'input' | 'node' | 'output';

let nodeCount = 0;

export interface NodeI {
	id: string;
	name?: string;
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

interface ConnectNodesProps {
	source: AudioNode;
	destination: AudioNode;
	onError?: (error: Error) => void;
}

function ConnectNodes(props: ConnectNodesProps): null {
	const { source, destination, onError } = props;

	const onErrorRef = useRef<undefined | ((error: Error) => void)>();
	onErrorRef.current = onError;

	useEffect(() => {
		if (!source || !destination) return;

		const handleError = (error: Error) => {
			if (onErrorRef.current) {
				onErrorRef.current(error);
			}
		}

		try {
			source.connect(destination);

			return () => {
				try {
					source.disconnect(destination);
				} catch (error) {
					handleError(error);
				}
			};
		} catch (error) {
			handleError(error);
		}
	}, [source, destination, onErrorRef]);

	return null;
}

interface ListenLinkProps {
	link: string;
	node: AudioNode;
	onError?: (error: Error) => void;
}

function ListenLink(props: ListenLinkProps): JSX.Element {
	const { link, node, onError } = props;

	const links = useNodes().filter((node) => node.name && node.name === link);

	return <>
		{links.map(link => (
			<ConnectNodes
				key={link.id}
				source={link.node}
				destination={node}
				onError={onError}
			/>
		))}
	</>;
}

export interface BaseNodeProps {
	name?: string;
	listen?: string[] | string;
	onNode?: (node: AudioNode) => void;
	onError?: (error: Error) => void;
}

export type BaseInNodeProps = Omit<BaseNodeProps, 'listen'>;
export type BaseOutNodeProps = BaseNodeProps;

export interface CustomNodeProps extends BaseNodeProps {
	type: NodeTypeT;
	node: AudioNode;
}

export function CustomNode(props: CustomNodeProps): JSX.Element {
	const {
		name,
		listen,
		type,
		node,
		onNode,
		onError,
	} = props;

	const id: string = useMemo(() => (nodeCount++).toString(36), []);
	const state: NodeI = useMemo(() => ({ name, type, node, id }), [name, type, node, id]);
	useNode(state);

	useEffect(() => {
		if (!onNode) return;
		onNode(node)
	}, [node, onNode]);

	const listeners = useMemo(() => {
		if (listen instanceof Array) return listen;
		if (typeof listen === 'string') return [listen];
		return [];
	}, [listen]);

	return <>
		{listeners.map(link => link && (
			<ListenLink
				key={link}
				link={link}
				node={node}
				onError={onError}
			/>
		))}
	</>;
}

export const useAudioNodes = useNodes;
