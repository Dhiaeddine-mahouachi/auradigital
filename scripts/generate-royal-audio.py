"""Original digitally synthesized Hijaz instrumental; no sampled recordings.
Dedicated to CC0 for the AuraWeddings preview. 48-second loop.
"""
import wave
import numpy as np
from pathlib import Path
rate=22050; duration=48; out=np.zeros(rate*duration,dtype=np.float64);rng=np.random.default_rng(17)
# D Hijaz phrase, played softly by a plucked-string resonator and a breathy lead.
phrase=[0,1,4,5,7,5,4,1,0,4,5,7,8,7,5,4,1,0,-5,0,1,4,5,4]
for bar in range(2):
 for i,step in enumerate(phrase):
  start=(bar*24+i)*rate;freq=146.832*2**(step/12);length=int(rate*2.7);t=np.arange(length)/rate
  delay=max(2,int(rate/freq));buf=rng.uniform(-.6,.6,delay);note=np.empty(length)
  for n in range(length):
   j=n%delay;buf[j]=.495*(buf[j]+buf[(j+1)%delay]);note[n]=buf[j]
  note=note*np.exp(-t*.65)*.38
  # Faint reed-like octave harmony with a slow breath envelope.
  reed=(np.sin(2*np.pi*freq*2*t+0.025*np.sin(2*np.pi*4.8*t))+.18*np.sin(2*np.pi*freq*4*t))
  note+=reed*np.minimum(1,t/.2)*np.exp(-t*2.0)*.045
  end=min(len(out),start+length);out[start:end]+=note[:end-start]
# Quiet low-string drone and short stereo-free room reflections.
t=np.arange(len(out))/rate;out+=.016*np.sin(2*np.pi*73.416*t)+.008*np.sin(2*np.pi*110*t)
for seconds,volume in [(.13,.2),(.31,.12),(.51,.07)]:
 d=int(seconds*rate);out[d:]+=out[:-d]*volume
fade=rate;out[:fade]*=np.linspace(0,1,fade);out[-fade:]*=np.linspace(1,0,fade)
out=np.tanh(out)*.7
path=Path(__file__).resolve().parents[1]/'weddings/royal-assets/oud-preview.wav'
with wave.open(str(path),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes((out*32767).astype('<i2').tobytes())
print(path)
