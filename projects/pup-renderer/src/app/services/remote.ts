import { NgZone } from '@angular/core';
import { Browser } from 'puppeteer';
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

    const browser: Browser = await puppeteer.connect({
      browserWSEndpoint: this.info.webSocketDebuggerUrl,
      defaultViewport: null,
    });

    const targets = await browser.targets();

    const addTarget = (target) => {
      if (target.type() === 'page' || target.type() === 'webview') {
        const t = new Target(browser, this.zone);
        t.url = target.url();
        t.original = target;
        this.zone.run(() => {
          this.targets.push(t);
        });
      }
    };

    targets.forEach((target) => {
      addTarget(target);
    });

    browser.on('targetcreated', (target) => {
      addTarget(target);
    });

    browser.on('targetdestroyed', (target) => {
      this.zone.run(() => {
        this.targets = this.targets.filter((t) => t.original !== target);
      });
    });

    browser.on('targetchanged', (target) => {
      const t = this.targets.find((t) => t.original === target);
      this.zone.run(() => {
        t.url = target.url();
      });
    });
  }
}
