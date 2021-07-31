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
			<GainNode name="gain" listen="mic" gain={0.5} />
			<SpeakerNode name="speaker" listen="gain" />
		</AudioProvider>
	);
}
```

All nodes can be provided the following:

* `name`: Unique name for the node
* `listen?`: Name node(s) to take data from. Not available on input nodes
* `onNode?`: AudioNode callback
* `onError?`: Error handler

Some node attributes can take sequence values that correspond with [AudioParam][mdn-audioparam].
These are provided as an Array `AudioParamSequence` in any comination of the following tuples:

* `setValueAtTime`:
  * `type`: 'setValue'
  * `value`: number
  * `startTime`: number
* `linearRampToValueAtTime`:
  * `type`: 'linearRamp'
  * `value`: number
  * `endTime`: number
* `exponentialRampToValueAtTime`:
  * `type`: 'exponentialRamp'
  * `value`: number
  * `endTime`: number
* `setTargetAtTime`:
  * `type`: 'setTarget'
  * `target`: number
  * `startTime`: number
  * `timeConstant`: number
* `setValueCurveAtTime`:
  * `type`: 'setValueCurve'
  * `values`: number[] | Float32Array
  * `startTime`: number
  * `duration`: number

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

### Oscillator Node

* `type?`: Oscillator type
* `frequency`: Frequency
* `frequencySequence?`: AudioParamSequence
* `detune?`: detune
* `detuneSequence?`: AudioParamSequence
* `start?`: Start time
* `end?`: End time
* `onEnded?`: Ended handler

### Speaker Node

* `deviceId?`: Media device id

### StreamOut Node

* `stream`: MediaStream

### Gain Node

* `gain`: Gain value
* `gainSequence?`: AudioParamSequence

### Analyser Node

* `type`: `frequency` or `waveform`
* `fftSize?`: FFT size
* `interval?`: Interval between updates
* `min?`: Decibels minimum
* `max?`: Decibels maximum
* `floatBuffer?`: Update with Float32Array
* `onUpdate`: Update data handler

### HzAnalyser Node

* `limit?`: Volume limit
* `padding?`: Gap padding
* `fftSize?`: FFT size
* `interval?`: Interval between updates
* `min?`: Decibels minimum
* `max?`: Decibels maximum
* `onUpdate`: Update data handler

### NoteAnalyser Node

* `noteList?`: Note list
* `limit?`: Volume limit
* `padding?`: Gap padding
* `fftSize?`: FFT size
* `interval?`: Interval between updates
* `min?`: Decibels minimum
* `max?`: Decibels maximum
* `onUpdate`: Update data handler

### Custom Node

* `type`: node type
* `node`: AudioNode

```jsx
import useAudio, { CustomNode } from 'react-audio-mixer';

function SomeNode(props) {
	const { name, listen, onError } = props;
	const { context, ready } = useAudio();

	const node = useMemo(() => {
		try {
			context.createDynamicsCompressor();
		catch(e) {}
	}, [context]);

	// Do something with your node

	return (
		<CustomNode
			name={name}
			listen={listen}
			type="node"
			node={node}
			onError={onError}
		/>
	);
}
```

## Examples

### PulseGain Node

```jsx
function PulseGain(props) {
	const { name, listen, min = 0, max = 1, interval = 2000 } = props;
	const { context } = useAudio();

	const [gainSequence, setGainSequence] = useState();

	useEffect(() => {
		const update = () => {
			const now = context.currentTime;
			setGainSequence([
				['linearRamp', max, interval / 2000 + now],
				['linearRamp', min, interval / 1000 + now],
			]);
		};

		update();
		const timer = setInterval(update, interval);

		return () => {
			clearInterval(timer);
		};
	}, [context, min, max, interval]);

	return (
		<GainNode
			name={name}
			listen={listen}
			gain={min}
			gainSequence={gainSequence}
		/>
	);
}
```

### RandomBeeps Node

```jsx
function RandomBeeps(props) {
	const { name, min = 256, max = 512, length = 500, margin = 500 } = props;
	const { context } = useAudio();

	const [[frequency, start, end], setState] = useState([0, 0, 0]);

	const updateState = useCallback((offset = 0) => {
		const now = context.currentTime + offset;

		setState([
			min + (max - min) * Math.random(),
			margin / 1000 + now,
			(margin + length) / 1000 + now,
		]);
	}, [context, min, max, length, margin]);

	useEffect(() => {
		updateState(-margin / 1000);
	}, [margin, updateState]);

	return frequency && (
		<OscillatorNode
			name={name}
			frequency={frequency}
			start={start}
			end={end}
			onEnded={updateState}
		/>
	);
}
```

## License

Copyright (c) 2021, Michael Szmadzinski. (MIT License)


[mdn-audio-param]: https://developer.mozilla.org/en-US/docs/Web/API/AudioParam