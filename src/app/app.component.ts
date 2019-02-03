import {Component} from '@angular/core';
import humanizeDuration from 'humanize-duration';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public BTimeMs = 2000;
  public ATimeMs = 1000;
  public CTimeMs = 2000;
  public TTimeMs = [2000, 2000, 2000];

  public rfScheme = [];
  public rfSchemeBalanced = [];

  public totalTime = '';
  public totalBalancedTime = '';

  public timeLine = [];
  public timeLineBalanced = [];

  onRemoveTClick($event, i) {
    this.TTimeMs.splice(i, 1);
    this.reset();
  }

  onAddTClick($event) {
    this.TTimeMs.push(2000);
    this.reset();
  }

  onCalculateClick($event) {
    this.rfScheme = this.buildScheme();
    const ms = this.getTotalTime(this.rfScheme);
    this.totalTime = `${ms}ms => ${humanizeDuration(ms)}`;
    this.timeLine = Array(Math.ceil(ms / 100)).fill(100);

    this.rfSchemeBalanced = this.buildBalanceScheme();
    const msBalanced = this.getTotalTime(this.rfSchemeBalanced);
    this.totalBalancedTime = `${msBalanced}ms => ${humanizeDuration(msBalanced)}`;
    this.timeLineBalanced = Array(Math.ceil(msBalanced / 100)).fill(100);
  }

  private buildScheme() {
    const result = [];
    let commandDistanceItems = 0;
    let traverseDistanceItems = 0;

    let insertedT = 0;

    do {
      result.push('B');
      result.push('A');
      commandDistanceItems += 2;
      traverseDistanceItems += 2;

      if (commandDistanceItems >= 6) {
        result.push('C');
        traverseDistanceItems += 1;
        commandDistanceItems = 0;
      }

      if (traverseDistanceItems >= 15) {
        result.push(insertedT + 1);
        traverseDistanceItems = 0;
        commandDistanceItems += 1;
        insertedT += 1;
      }
    } while (insertedT < this.TTimeMs.length);

    return result;
  }

  buildBalanceScheme() {
    const result = [];

    let ADistanceMs = 0;
    let TDistanceMs = 0;

    let lastAItemIndex = 0;
    let lastTItemIndex = 0;

    let insertedT = 0;

    do {
      if (insertedT === 0) {
        result.push(insertedT + 1);
        insertedT += 1;
        lastTItemIndex = 1;
      }

      result.push('B');

      ADistanceMs = this.getTotalTime(result.slice(lastAItemIndex));

      // insert A every 25 seconds
      if (ADistanceMs >= 25 * 1000) {
        result.push('A');
        lastAItemIndex = result.length - 1;
      }

      TDistanceMs = this.getTotalTime(result.slice(lastTItemIndex));

      // insert T every 5 minutes
      if (TDistanceMs >= 5 * 60 * 1000) {
        result.push(insertedT + 1);
        insertedT += 1;
        lastTItemIndex = result.length - 1;
      }

      // last one is C
      if (insertedT === this.TTimeMs.length) {
        result.push('C');
      }
    } while (insertedT < this.TTimeMs.length);

    return result;
  }

  getTotalTime(rfScheme): number {
    return rfScheme.reduce((acc, item) => acc + this.getItemTime(item), 0);
  }

  getItemTime(item) {
    switch (item) {
      case 'B':
        return this.BTimeMs;
      case 'A':
        return this.ATimeMs;
      case 'C':
        return this.CTimeMs;
      default:
        return this.TTimeMs[item - 1];
    }
  }

  getItemName(item) {
    switch (item) {
      case 'B':
      case 'A':
      case 'C':
        return item;
      default:
        return `T${item}`;
    }
  }

  getDuration(ms) {
    const shortEnglishHumanizer = humanizeDuration.humanizer({
      language: 'shortEn',
      languages: {
        shortEn: {
          y: () => 'y',
          mo: () => 'mo',
          w: () => 'w',
          d: () => 'd',
          h: () => 'h',
          m: () => 'm',
          s: () => 's',
          ms: () => 'ms',
        }
      }
    });
    return shortEnglishHumanizer(ms);
  }

  getResultPath(r) {
    return r.map(e => this.getItemName(e)).join(' ');
  }

  reset() {
    this.rfScheme = [];
    this.rfSchemeBalanced = [];

    this.totalTime = '';
    this.totalBalancedTime = '';

    this.timeLine = [];
    this.timeLineBalanced = [];
  }
}
