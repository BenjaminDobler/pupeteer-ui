import { Browser, Page } from 'puppeteer';
import { Queue } from '../util/queue';
import { wait } from '../util/wait';
import { RecordEvent } from './recording';

export class Playback {
  currentStepIndex = 0;
  playbackQueue: Queue = new Queue();
  page: Page;

  constructor(private events: RecordEvent[], private browser: Browser) {}

  async start() {
    this.currentStepIndex = 0;
    const page = await this.browser.newPage();
    this.page = page;
    await page.goto(this.events[0].value);
    await page.bringToFront();

    this.currentStepIndex = 1;

    this.events.forEach((event: RecordEvent, index) => {
      if (event.type === 'click') {
        this.playbackQueue.add(this.beforeStep, this, index);
        this.playbackQueue.add(this.click, this, event.selector);
      } else if (event.type === 'type') {
        this.playbackQueue.add(this.beforeStep, this, index);
        this.playbackQueue.add(this.type, this, event.selector, event.value);
      } else if (event.type === 'scroll') {
        this.playbackQueue.add(this.beforeStep, this, index);
        this.playbackQueue.add(this.scroll, this, event.selector, event.value);
      }
    });
    this.playbackQueue.add(this.done, this);
  }

  async beforeStep(index) {
    console.log('Step ', index);
    await wait(2000);
  }

  async done() {
    console.log('Playback done!');
  }

  async click(selector) {
    console.log('execute click: ', selector);
    // await beforeStep('click', selector);
    const element = await this.page.waitForSelector(selector, {
      visible: true,
    });
    await element.click();
  }

  async scroll(selector, value) {
    console.log('execute scroll ', value);
    await this.page.evaluate((scrollPos) => {
      window.scrollTo({ top: scrollPos });
    }, value);
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
    console.log('execute type ', selector, value);

    // await beforeStep('type', selector, value);
    const element = await this.page.waitForSelector(selector, {
      visible: true,
    });
    await element.click({ clickCount: 3 });
    await element.press('Backspace');
    await element.type(value);
  }
}
