import { NgZone } from '@angular/core';
import * as puppeteer from 'puppeteer-core';
import { Target } from './target';

export class Remote {
  public connected = false;
  public info: any;
  public targets: Target[] = [];

  constructor(public port, private zone: NgZone) {}

  async connect() {
    const res = await fetch(`http://localhost:${this.port}/json/version`);
    this.info = await res.json();
    this.connected = true;

    console.log(this.info);

    const browser = await puppeteer.connect({
      browserWSEndpoint: this.info.webSocketDebuggerUrl,
      defaultViewport: null,
    });

    const targets = await browser.targets();

    targets.forEach((target) => {
      if (target.type() === 'page' || target.type() === 'webview') {
        const t = new Target(this.zone);
        t.original = target;
        this.targets.push(t);
      }
    });

    browser.on('targetcreated', (target) => {
      if (target.type() === 'page' || target.type() === 'webview') {
        const t = new Target(this.zone);
        t.original = target;
        this.zone.run(() => {
          this.targets.push(t);
        });
      }
    });
  }
}
