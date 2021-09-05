import { useCallback, useRef } from "react";

export type ErrorCallback = (error: unknown) => void;

export default function useErrorCallback(callback: ErrorCallback | undefined): ErrorCallback {
	const ref = useRef<ErrorCallback | undefined>();
	ref.current = callback;

	const handleError = useCallback((error: unknown) => {
		if (!ref.current) return;
		ref.current(error);
	}, [ref]);

	return handleError;
}
