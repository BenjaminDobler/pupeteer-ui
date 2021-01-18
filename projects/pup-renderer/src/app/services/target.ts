import { NgZone } from '@angular/core';
import { Browser } from 'puppeteer';
import { Playback } from './playback';
import { Recording } from './recording';

export class Target {
  url: string;
  original: any;
  recordings: Recording[] = [];
  recording = false;
  currentRecording: Recording;

  constructor(private browser: Browser, private zone: NgZone) {}

  startRecording() {
    const recording = new Recording(this.original, this.zone);
    this.currentRecording = recording;
    recording.start();
  }

  startPlayback(recording: Recording) {
    const playback = new Playback(recording.events, this.browser);
    playback.start();
  }
}
