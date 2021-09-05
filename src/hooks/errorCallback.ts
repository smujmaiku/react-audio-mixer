import { useCallback, useRef } from "react";

type ErrorCallback = (error: Error) => void;

export default function useErrorCallback(callback: ErrorCallback | undefined): ErrorCallback {
	const ref = useRef<ErrorCallback | undefined>();
	ref.current = callback;

	const handleError = useCallback((error: Error) => {
		if (!ref.current) return;
		ref.current(error);
	}, [ref]);

	return handleError;
}
