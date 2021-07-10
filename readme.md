# React Audio Mixer

Do you need audio options in React without the fuss of dealing with contexts?
Are you trying to mix a bunch of AudioNode objects together but it's hard?
Do you have lots of componants trying to work together with audioNodes?

Use `react-audio-mixer` to make music in your React apps!

## Usage

```jsx
function App() {
	return (
		<AudioProvider>
			<MicrophoneNode name="mic" echoCancellation noiseSuppression />
			<GainNode name="gain" connect="mic" gain={0.5} />
			<SpeakerNode name="speaker" connect="gain" />
		</AudioProvider>
	);
}
```

All nodes can be provided the following:

* `name`: Unique name for the node
* `connect?`: Name node(s) to take data from. Not available on input nodes
* `onError?`: Error handler

### AudioProvider

Creates an audio context for this module

* `latencyHint?`: Context latency hint
* `sampleRate?`: Context sample rate

### useAudio default

Returns the context and status of the `AudioProvider`

### useAudioDevices

Requests and gathers available audio media devices.

```jsx
const [devices, ready] = useAudioDevices();
```

### useAudioInputDevices

Requests and gathers available input audio media devices.

```jsx
const [devices, ready] = useAudioInputDevices();
```

### useAudioOutputDevices

Requests and gathers available output audio media devices.

```jsx
const [devices, ready] = useAudioOutputDevices();
```

### Microphone Node

* `deviceId?`: Media device id
* `echoCancellation?`: Echo cancellation
* `noiseSuppression?`: Noise suppression
* `autoGainControl?`: Auto gain control

### StreamIn Node

* `stream`: MediaProvider

### Speaker Node

* `deviceId?`: Media device id

### StreamOut Node

* `stream`: MediaStream

### Gain Node

* `gain`: Gain value

### Analyser Node

* `fftSize?`: FFT size
* `interval?`: Interval between updates
* `onUpdate`: Update data handler

### Custom Node

* `type`: node type
* `node`: AudioNode

```jsx
import useAudio, { CustomNode } from 'react-audio-mixer';

function SomeNode(props) {
	const { name, connect, onError } = props;
	const { context, ready } = useAudio();

	// Make an AudioNode of some sort

	return (
		<CustomNode
			name={name}
			connect={connect}
			type="node"
			node={node}
			onError={onError}
		/>
	);
}
```

## License

Copyright (c) 2021, Michael Szmadzinski. (MIT License)
