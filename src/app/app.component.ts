import {Component} from '@angular/core';
import Humanizer from 'humanize-duration-es6';
import localeEn from 'humanize-duration-es6/dist/locale/en';

@Component({
    selector: 'app-root',
    template: `
        <div class="time-inputs">
            <h3>Alarm, Beacon and Command distances (in ms)</h3>
            <ul>
                <li>
                    <label>
                        <span>ALARM TIME (ms)</span>
                        <input type="number" [(ngModel)]="ATimeMs">
                    </label>
                </li>
                <li>
                    <label>
                        <span>BEACON TIME (ms)</span>
                        <input type="number" [(ngModel)]="BTimeMs">
                    </label>
                </li>
                <li>
                    <label>
                        <span>COMMAND TIME (ms)</span>
                        <input type="number" [(ngModel)]="CTimeMs">
                    </label>
                </li>
            </ul>

            <h3>Traverse distances (in ms)</h3>
            <button (click)="onAddTClick($event)">add T</button>
            <ul>
                <li *ngFor="let time of TTimeMs; index as i;">
                    <label>
                        <span>T{{i + 1}} TIME (ms)</span>
                        <input type="text" [(ngModel)]="time">
                        <button *ngIf="TTimeMs.length > 1" (click)="onRemoveTClick($event, i)">remove</button>
                    </label>
                </li>
            </ul>
            <button (click)="onCalculateClick($event)">Calculate</button>
        </div>
        <hr>
        <h3>Build Scheme</h3>
        <div class="result">
            <p>Total time: {{ totalTime }}</p>

            <p>Result: {{ rfScheme.join(' ') }}</p>
            <ul class="rf-scheme">
                <li *ngFor="let item of rfScheme; index as i;" [ngClass]="'block-' + item"
                    [style.width.px]="getItemTime(item) / 10">
                    <span class="index">{{ i + 1 }}</span>
                    <span class="name">{{getItemName(item)}}</span>
                    <span class="duration">{{ getItemTime(item) }}ms</span>
                </li>
            </ul>
            <ul class="rf-scheme">
                <li class="time-line" *ngFor="let time of timeLine; index as i;"
                    [ngClass]="{ 'half': i % 5 === 0, 'full': i % 10 === 0 }">
                    <span *ngIf="i % 10 === 0"> {{ getDuration(i * 100)}} </span>
                </li>
            </ul>
        </div>
        <hr>
        <h3>Balanced Scheme</h3>
        <div class="result">
            <p>Total time: {{ totalBalancedTime }}</p>

            <p>Result: {{ rfSchemeBalanced.join(' ') }}</p>
            <ul class="rf-scheme">
                <li *ngFor="let item of rfSchemeBalanced; index as i;" [ngClass]="'block-' + item"
                    [style.width.px]="getItemTime(item) / 10">
                    <span class="index">{{ i + 1 }}</span>
                    <span class="name">{{getItemName(item)}}</span>
                    <span class="duration">{{ getItemTime(item) }}ms</span>
                </li>
            </ul>
            <ul class="rf-scheme">
                <li class="time-line" *ngFor="let time of timeLineBalanced; index as i;"
                    [ngClass]="{ 'half': i % 5 === 0, 'full': i % 10 === 0 }">
                    <span *ngIf="i % 10 === 0"> {{ getDuration(i * 100)}} </span>
                </li>
            </ul>
        </div>
    `,
    styles: [`
        ul li label span {
            width: 180px;
            display: inline-block;
        }

        .rf-scheme {
            margin: 0;
            padding: 0;
            white-space: nowrap;
        }

        .rf-scheme li {
            margin: 0;
            padding: 0;
            list-style: none;
            display: inline-block;
            background-color: whitesmoke;
            height: 50px;
            position: relative;
        }

        .rf-scheme li .name {
            display: block;
            text-align: center;
            font-weight: bold;
            font-size: 22px;
            font-family: sans-serif;
            margin: 4px;
        }

        .rf-scheme li .index {
            position: absolute;
            color: gray;
            top: 0;
            right: 0;
            padding: 1px 2px;
            border-right: 1px solid black;
        }

        .rf-scheme li .duration {
            position: absolute;
            color: gray;
            bottom: 0;
            left: 0;
        }

        .rf-scheme li.block-B {
            background-color: lightskyblue;
        }

        .rf-scheme li.block-A {
            background-color: lightpink;
        }

        .rf-scheme li.block-C {
            background-color: lightgoldenrodyellow;
        }

        .rf-scheme li.time-line {
            background-color: white;
            width: 9px;
            height: 20px;
            border-left: 1px solid black;
            vertical-align: top;
            position: relative;
        }

        .rf-scheme li.time-line.half {
            height: 40px;
        }

        .rf-scheme li.time-line.full {
            height: 60px;
        }

        .rf-scheme li.time-line span {
            position: absolute;
            bottom: 0;
        }
    `]
})
export class AppComponent {
    public BTimeMs = 2000;
    public ATimeMs = 1000;
    public CTimeMs = 2000;
    public TTimeMs = [2000, 2000, 2000];

    public rfScheme = [];
    public totalTime = '';
    public timeLine = [];

    public rfSchemeBalanced = [];
    public totalBalancedTime = '';
    public timeLineBalanced = [];

    onRemoveTClick($event, i) {
        this.TTimeMs.splice(i, 1);
    }

    onAddTClick($event) {
        this.TTimeMs.push(2000);
    }

    onCalculateClick($event) {
        console.log('calculate');

        this.rfScheme = this.buildScheme();
        const ms = this.getTotalTime(this.rfScheme);
        this.totalTime = `${ms}ms => ${(new Humanizer(localeEn)).humanize(ms)}`;
        this.timeLine = Array(Math.ceil(ms / 100)).fill(100);

        this.rfSchemeBalanced = this.buildBalanceScheme();
        const msBalanced = this.getTotalTime(this.rfSchemeBalanced);
        this.totalBalancedTime = `${msBalanced}ms => ${(new Humanizer(localeEn)).humanize(msBalanced)}`;
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
                return this.CTimeMs;
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
        const shortEnLocale = {
            y: () => 'y',
            mo: () => 'mo',
            w: () => 'w',
            d: () => 'd',
            h: () => 'h',
            m: () => 'm',
            s: () => 's',
            ms: () => 'ms',
            decimal: () => '.'
        };

        const shortEnglishHumanizer = new Humanizer(shortEnLocale, {spacer: '', delimiter: ' '});
        return shortEnglishHumanizer.humanize(ms);
    }
}
