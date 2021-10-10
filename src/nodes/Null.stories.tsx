import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { AudioProvider } from '../audio';
import Debugger from '../labs/Debugger';
import NullNode from './Null';

export default {
	title: 'Nodes/Null',
	component: NullNode,
	argTypes: {
		name: {
			description: 'Name of the node to allow listening',
			control: 'text',
		},
		listen: {
			description: 'List of node names to listen',
			control: 'text',
		},
		onNode: {
			description: '',
			action: 'onNode',
		},
		onError: {
			description: '',
			action: 'onError'
		},
	},
} as ComponentMeta<typeof NullNode>;

const Template: ComponentStory<typeof NullNode> = (args) => {
	return (
		<AudioProvider>
			<Debugger name="tone" listen="null" />
			<NullNode
				{...args}
			/>
		</AudioProvider>
	);
};

export const Basic = Template.bind({});
Basic.args = {
	name: 'null',
	listen: 'tone',
};
