import { Injectable, NgZone } from "@angular/core";
import { Remote } from "./remote";


@Injectable()
export class Remotes {

    remotes: Remote[] = [];

    constructor(private zone: NgZone) {

    }

    addRemote(port: number) {
        const r = new Remote(port, this.zone);
        this.remotes.push(r);
    }

}