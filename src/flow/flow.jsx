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

function getLinks(name, listen) {
	if(typeof listen === 'string') {
		return getLinks(name, [listen]);
	}

	if(listen instanceof Array) {
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

function FlowElement() {
	return 'ELEMENT!'
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

	const handleConnect = useCallback((event) => {
		const { source, target } = event;
		if(source === target) return;

		setState((current) => {
			const row = current.filter(r => r.name === target)[0];
			if(!row) return current;
			const exists = row.listen?.some(v => v === source);
			if(exists) return current;
			return [
				...current.filter(r => r.name !== target),
				{
					...row,
					listen: [...row.listen || [], source],
				},
			];
		});
	})

	return (<FlowRenderer
		elements={elements} 
		nodesConnectable
		nodesDraggable
		// onLoad={handleLoad}
		// onNodeDragStop={handleNodeDrag}
		onConnect={handleConnect}
		snapToGrid
		snapGrid={[20, 20]}
	/>)
}