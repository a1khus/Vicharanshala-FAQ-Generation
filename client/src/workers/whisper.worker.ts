import { pipeline, env } from '@xenova/transformers';

// Skip local model check since we are running in browser and fetching from HF hub
env.allowLocalModels = false;
env.useBrowserCache = true;

class PipelineSingleton {
    static task = 'automatic-speech-recognition';
    static model = 'Xenova/whisper-tiny.en';
    static instance: any = null;

    static async getInstance(progress_callback?: Function) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, {
                progress_callback,
            });
        }
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event: MessageEvent) => {
    const { type, audio } = event.data;
    
    if (type === 'load') {
        try {
            await PipelineSingleton.getInstance((x: any) => {
                self.postMessage({ status: 'progress', progress: x });
            });
            self.postMessage({ status: 'ready' });
        } catch (err: any) {
            self.postMessage({ status: 'error', error: err.message });
        }
    } else if (type === 'transcribe') {
        try {
            const transcriber = await PipelineSingleton.getInstance();
            // audio should be a Float32Array sampled at 16000Hz
            const output = await transcriber(audio);
            self.postMessage({ status: 'complete', output: output.text });
        } catch (err: any) {
            self.postMessage({ status: 'error', error: err.message });
        }
    }
});
