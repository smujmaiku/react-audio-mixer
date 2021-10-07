import React, { useCallback, useRef } from "react";
import { Canvas } from "react-canvas-resize";
import { AnalyserNode, AnalyserNodeProps } from "../audio";

export interface CanvasAnalyzerProps extends Omit<AnalyserNodeProps, 'type' | 'floatBuffer' | 'onUpdate'> {
	height: number;
	width: number;
	color?: string;
}

export default function CanvasAnalyzer(props: CanvasAnalyzerProps): JSX.Element {
	const {
		height,
		width,
		color = 'red',
		...analyserProps
	} = props;
	const bufferRef = useRef<Uint8Array>(Uint8Array.from([]));

	const handleUpdate = useCallback((buffer: Uint8Array) => {
		bufferRef.current = buffer;
	}, []);

	const handleDraw = useCallback(({ canvas }) => {
		const ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.strokeRect(0, 0, canvas.width, canvas.height);

		ctx.save();
		ctx.fillStyle = color;
		const width = canvas.width / (bufferRef.current.length + 1);
		for (let i = 0; i < bufferRef.current.length; i++) {
			const g = bufferRef.current[i];
			const h = (g / 255) ** 2;
			ctx.fillRect(i * width, canvas.height, width, -h * canvas.height);
		}
		ctx.restore();

		ctx.fillText(bufferRef.current.length, 2, 12);
	}, [color]);

	return (
		<>
			<Canvas height={height} width={width} onDraw={handleDraw} />
			<AnalyserNode
				{...analyserProps}
				type="frequency"
				onUpdate={handleUpdate}
			/>
		</>
	);
}
