# Voice tools

All spoken lines (words, sentences, lessons, dialog) are recorded with
[Kokoro](https://github.com/thewh1teagle/kokoro-onnx), a natural-sounding neural voice that runs locally.

One-time setup (from `wordhollow/`):

    brew install uv
    uv venv --python 3.12 tools/.venv
    uv pip install --python tools/.venv/bin/python kokoro-onnx soundfile faster-whisper scipy
    mkdir -p tools/models && cd tools/models
    curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
    curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin

Record (only new or changed lines are re-recorded):

    tools/.venv/bin/python tools/make-audio.py --verify

`--verify` listens back to each dictation word with Whisper and retries small
variations until it's heard as the right word. `--voice af_bella` etc. to try another voice.

Check every word and sentence clip:

    tools/.venv/bin/python tools/check-audio.py
