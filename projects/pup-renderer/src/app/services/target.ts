import { NgZone } from "@angular/core";
import { Recording } from "./recording";



export class Target {

    original: any;
    recordings: Recording[] = [];

    recording = false;

    currentRecording: Recording;

    constructor(private zone: NgZone) {

    }

    startRecording() {
        const recording = new Recording(this.original, this.zone);
        this.currentRecording = recording;
        recording.start();
    }

}