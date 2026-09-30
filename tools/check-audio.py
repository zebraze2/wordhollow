"""Listens back to every word and sentence clip with Whisper (speech-to-text)
and flags any that don't come out as the intended word — a mispronounced word
in a dictation game would teach the wrong spelling.

  tools/.venv/bin/python tools/check-audio.py
"""
import json, os, re, subprocess, sys, tempfile
import numpy as np, soundfile as sf
from difflib import SequenceMatcher
from faster_whisper import WhisperModel

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
js = "global.window=global;require(%r);process.stdout.write(JSON.stringify(window.CLIPS))" % os.path.join(ROOT, 'js', 'words.js')
clips = json.loads(subprocess.check_output(['node', '-e', js]))
model = WhisperModel('small.en', device='cpu', compute_type='int8')

# a word said alone can't be told apart from its homophone; the sentence clip settles it
HOMOPHONES = {'to': {'two', 'too'}, 'sun': {'son'}, 'tail': {'tale'}, 'fur': {'fir'}, 'fin': {'finn'}, 'be': {'bee'},
              'read': {'reed', 'red'}, 'red': {'read'}, 'rain': {'reign', 'rein'}, 'sea': {'see'}, 'one': {'won'},
              'win': {'when'}, 'when': {'win'}, 'pen': {'pin'}, 'pin': {'pen'}, 'hen': {'hin'}, 'whip': {'wip'},
              'bed': {'bad'}, 'jam': {'jim'}, 'lid': {'lead'}, 'of': {'love', 'uh'}, 'some': {'sum'}, 'rode': {'road'},
              'road': {'rode', 'rowed'}, 'were': {'where'}, 'her': {'hur'}, 'dig': {'dick'}}
norm = lambda s: re.sub(r"[^a-z' ]", '', s.lower()).strip()

def hear(cid):
    with tempfile.NamedTemporaryFile(suffix='.wav') as t:
        subprocess.run(['afconvert', '-f', 'WAVE', '-d', 'LEI16@16000', '-c', '1', os.path.join(ROOT, 'audio', cid + '.m4a'), t.name], check=True)
        audio, _ = sf.read(t.name, dtype='float32')
    audio = np.concatenate([np.zeros(8000, np.float32), audio, np.zeros(8000, np.float32)])  # Whisper hears lone words better with room around them
    segs, _ = model.transcribe(audio, language='en', beam_size=5, vad_filter=False)
    return norm(' '.join(s.text for s in segs))

bad = []
words = sorted(k for k in clips if k.startswith('w_'))
for cid in words:
    w = clips[cid]['text']
    got = hear(cid)
    ok = got == w or got in HOMOPHONES.get(w, set())
    s_got, s_want = hear('s_' + w), norm(clips['s_' + w]['text'])
    s_ok = w in s_got.split() or SequenceMatcher(None, s_got, s_want).ratio() > .9
    mark = '  ' if ok and s_ok else '!!'
    print(f'{mark} {w:10} word→ "{got}"   sentence→ "{s_got}"', flush=True)
    if not (ok and s_ok): bad.append(w)
print('\nflagged:', bad if bad else 'none')
