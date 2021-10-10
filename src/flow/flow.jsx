import React, { useMemo, useState, useCallback } from 'react';
import FlowRenderer from 'react-flow-renderer';

function getPositionOpts(type) {
	switch(type) {
	case 'input':
		return {
			type: 'input',
			sourcePosition: 'right',
		}
		case 'output':
		return {
			type: 'output',
			targetPosition: 'left',
		};
	default:
		return {
			sourcePosition: 'right',
			targetPosition: 'left',
		};
	}
}

function getNode(nodes, name) {
	return nodes.filter(n => n.name === name)[0];
}

function patchNode(nodes, node) {
	const { name } = node;
	const current = getNode(nodes, name);
	if(!current) return nodes;

	return [
		...nodes.filter(n => n.name !== name),
		{
			...current,
			...node,
		},
	];
}

function getLinks(name, listen) {
	if (typeof listen === 'string') {
		return getLinks(name, [listen]);
	}

	if (listen instanceof Array) {
		return listen.map(source => ({
			id: `e-${source}-${name}`,
			source,
			target: name,
			type: 'smoothstep',
			animated: true,
		}));
	}
	
	return [];
}

function FlowElement(node) {
	switch(node.type) {
	case 'microphone':
		return 'mic';
	case 'gain':
		return 'gain';
	case 'speaker':
		return 'speaker';
	}
	return `unknown element(${node.type})`;
}

function useFlowElements(state) {
	return useMemo(() => state.reduce((list, node) => ([
		...list,
		{
			id: node.name,
			...getPositionOpts(node.type),
			data: {
				label: <FlowElement node={node} />,
			},
			position: { x: node.x, y: node.y },
		},
		...getLinks(node.name, node.listen),
	]), []), [state]);
}

export default function Flow(){
	const [state, setState] = useState([
		{ name: '1', type: 'input', x: 100, y: 100 },
		{ name: '2', x: 400, y: 200 },
		{ name: '3', type: 'output', x: 700, y: 300 },
	]);
	
	const elements = useFlowElements(state);

	const handleNodeDrag = useCallback((_, event) => {
		const {id, position} = event;
		setState((current) => {
			return patchNode(current, {
				name: id,
				position,
			});
		});
	}, [])

	const handleConnect = useCallback((event) => {
		const { source, target } = event;
		if (source === target) return;

		setState((current) => {
			const row = getNode(current, target);
			if (!row) return current;
			const exists = row.listen?.some(v => v === source);
			if (exists) return current;
			return patchNode(current, {
				name: target,
				listen: [...row.listen || [], source],
			});
		});
	})

	return (<FlowRenderer
		elements={elements} 
		nodesConnectable
		nodesDraggable
		// onLoad={handleLoad}
		onNodeDragStop={handleNodeDrag}
		onConnect={handleConnect}
		snapToGrid
		snapGrid={[20, 20]}
	/>)
}