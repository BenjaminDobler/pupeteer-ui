import { NgZone } from '@angular/core';
import { remote } from 'electron';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Frame, Page, Target } from 'puppeteer';
declare var window: any;
declare var addEventListener: any;

export class Recording {
  page: Page;
  events: any[] = [];

  constructor(private target: Target, private zone: NgZone) {}

  async start() {
    this.page = await this.target.page();
    const page = this.page;

    await page.exposeFunction('onHandle', (text) => {
      console.log('handle clicked');
    });

    await page.exposeFunction('onSelector', (selector) => {
      selector = selector;
    });

    await page.exposeFunction('recordEvent', (event) => {
      console.log(event);
      this.zone.run(() => {
        this.events.push(event);
      });
    });



    const inject = () => {

        const body = document.querySelector('body');
        var p: HTMLElement = document.querySelector('#ppt-highlighter');
        if (!p) {
          p = document.createElement('div');
          p.setAttribute('id', 'ppt-highlighter');
          p.style.position = 'absolute';
          p.style.width = '100px';
          p.style.height = '100px';
          p.style.border = '1px solid #0000ff';
          p.style.background = 'rgba(0,0,1,0.2)';
          p.style.pointerEvents = 'none';
          p.style.transition = 'all';
          p.style.transitionDuration = '300ms';
          p.style.zIndex = '5000';
          document.body.appendChild(p);
        }
  
        p.addEventListener('click', function () {
          window.onHandle();
        });
  
        var hint: HTMLElement = document.querySelector('#ppt-hint');
  
        if (!hint) {
          hint = document.createElement('div');
          hint.setAttribute('id', 'ppt-hint');
          hint.style.position = 'absolute';
          hint.style.bottom = '0';
          hint.style.left = '0';
          hint.style.border = '1px solid #0000ff';
          hint.style.background = '#fff';
          hint.style.pointerEvents = 'none';
          document.body.appendChild(hint);
        }
  
        window.moveHandle = function (x, y) {
          // p.style.transform = "translate(" + x + "px, " + y + "px)";
        };
  
        var currentTarget;
        var selector;
  
        window.addEventListener(
          'mousemove',
          (event) => {
            if (event.target !== currentTarget) {
              currentTarget = event.target;
              var rect = currentTarget.getBoundingClientRect();
              p.style.left = rect.left + 'px';
              p.style.top = rect.top + 'px';
              p.style.width = rect.width + 'px';
              p.style.height = rect.height + 'px';
              selector = window.finder(event.target, {});
              hint.textContent = selector;
              window.onSelector(selector);
            }
          },
          true
        );
  
        window.addEventListener(
          'click',
          (event) => {
            console.log('Click ', selector);
            window.recordEvent({
              selector: selector,
              type: 'click',
            });
          },
          true
        );
  
        window.addEventListener(
          'change',
          (event) => {
            console.log('value', event.target.value);
            console.log('Change ', selector);
            window.recordEvent({
              selector: selector,
              value: event.target.value,
              type: 'change',
            });
          },
          true
        );
    }

    await this.injectFinder(page);
    await page.evaluate(inject);
    console.log('injected');

    page.on('domcontentloaded', async () => {
      await this.injectFinder(page);
      await page.evaluate(inject);
    });

    page.on('framenavigated', async (frame: Frame) => {
        if (frame.parentFrame()) {
            return;
        }

        // addScript(`expect(page.url()).resolves.toBe(${escapeSelector(frame.url())});`);
        // addCommand({
        //     command: 'expect',
        //     value: frame.url(),
        //     script: `expect(page.url()).resolves.toBe(${escapeSelector(frame.url())});`,
        // });
    });

    setTimeout(async () => {
      await page.evaluate(() => {
        window.moveHandle(200, 200);
      });
    }, 2000);
  }

  async injectFinder(page) {
    console.log(__dirname);
    const scriptToInject = readFileSync(
      join(
        remote.app.getAppPath(),
        'renderers',
        'pup-renderer',
        'assets',
        'finder.js'
      ),
      { encoding: 'utf-8' }
    );
    await page.evaluate((scriptText) => {
      let el = document.querySelector('#ppt-finder-script');
      if (!el) {
        const el = document.createElement('script');
        el.setAttribute('id', 'ppt-finder-script');
        el.type = 'text/javascript';
        el.textContent = scriptText;
        document.body.parentElement.appendChild(el);
      }
    }, scriptToInject);
    await page.evaluate(() => {});
  }
}
