import { useState, useEffect } from 'react';

const LOADING = 'loading';
const READY = 'ready';
const ERROR = 'error';

const findScript = (src) => document.querySelector(`script[data-src="${src}"]`);

const initialStatus = (src) => {
    if (!src) return ERROR;
    return findScript(src)?.dataset.status || LOADING;
};

export const useScript = (src) => {
    const [state, setState] = useState(() => ({ src, status: initialStatus(src) }));

    if (state.src !== src) {
        setState({ src, status: initialStatus(src) });
    }

    useEffect(() => {
        if (!src) return undefined;

        let script = findScript(src);
        if (!script) {
            script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.dataset.src = src;
            script.dataset.status = LOADING;
            document.head.appendChild(script);
        }

        const update = (status) => () => {
            script.dataset.status = status;
            setState({ src, status });
        };
        const handleLoad = update(READY);
        const handleError = update(ERROR);

        script.addEventListener('load', handleLoad);
        script.addEventListener('error', handleError);

        return () => {
            script.removeEventListener('load', handleLoad);
            script.removeEventListener('error', handleError);
        };
    }, [src]);

    return state.status;
};
