import { Browser, Page } from 'puppeteer';
import { Queue } from '../util/queue';
import { RecordEvent } from './recording';

export class Playback {
  currentStepIndex = 0;
  playbackQueue: Queue = new Queue();
  page: Page;

  constructor(private events: RecordEvent[], private browser: Browser) {}

  async start() {
    this.currentStepIndex = 0;
    const page = await this.browser.newPage(); // open new tab
    this.page = page;
    await page.goto(this.events[0].value); // go to github.com
    await page.bringToFront();

    this.currentStepIndex = 1;

    this.events.forEach((event: RecordEvent) => {
      // this.playbackQueue.add(this.beforeStep, this);
      if (event.type === 'click') {
        this.playbackQueue.add(this.click, this, event.selector);
      }
    });
    this.playbackQueue.add(this.done, this);

    
  }

  async done() {
    console.log('Playback done!')
  }

  async click(selector) {
    console.log('execute click');
    // await beforeStep('click', selector);
    const element = await this.page.waitForSelector(selector, {
      visible: true,
    });
    await element.click();
  }

  async mousedown(selector) {
    // console.log('execute click');
    // // await beforeStep('click', selector);
    // const element = await this.page.waitForSelector(selector, {
    //   visible: true,
    // });
    // await element.mouse.down();
  }

  async type(selector, value) {
    console.log('execute type');

    // await beforeStep('type', selector, value);
    const element = await this.page.waitForSelector(selector, {
      visible: true,
    });
    await element.click({ clickCount: 3 });
    await element.press('Backspace');
    await element.type(value);
  }
}
