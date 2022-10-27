import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartType } from 'angular-google-charts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChild('chart ', { static: false }) chart: any;

  ringServerList: string[] = [];
  serverRingMap: any = {};
  servers: string[] = [];
  ringSize: number = 256;
  serverLimit: number = 5;
  virtualNodeFactor: number = 4;

  type = ChartType.PieChart;
  data = [['R0', 1]];
  columnNames = ['', ''];
  options = {
    slices: { 0: { color: 'grey' }, 2: { color: 'grey' } },
    pieHole: 0.8,
    legend: 'none',
    pieSliceText: 'none',
    backgroundColor: '#333',
    pieSliceBorderColor: 'transparent'
  };

  colors = ['#2196F3', '#FF5722', '#673AB7', '#009688', '#E91E63', '#FFEB3B'];

  ngOnInit() {
    this.initChart();
    this.updateChart();
  }

  initChart() {
    const dataRes = [];
    const slicesRes: any = {};

    for (let i = 0; i < this.ringSize; i++) {
      dataRes.push(['Ring ' + i, 1]);
      slicesRes[i.toString()] = { color: 'grey' };
    }
    this.data = dataRes;
    this.options.slices = slicesRes;
  }

  updateChart() {
    this.mapRingsToServers();
    const slicesRes: any = {};
    for (let i = 0; i < this.ringSize; i++) {
      if (this.ringServerList[i] && this.ringServerList[i].split(' ')[1]) {
        slicesRes[i.toString()] = {
          color: this.colors[Number(this.ringServerList[i].split(' ')[1])],
        };
      } else {
        slicesRes[i.toString()] = { color: 'grey' };
      }
    }
    this.options.slices = slicesRes;
    this.data = Object.assign([], this.data);
    this.options = Object.assign([], this.options);
  }

  addServer() {
    if (this.servers.length >= this.serverLimit) {
      alert('Server limit reached!');
      return;
    }
    this.servers.push('Server ' + this.servers.length);
    this.updateChart();
  }

  removeServer() {
    this.servers.pop();
    console.log(this.servers);
    this.updateChart();
  }

  mapRingsToServers() {
    let ringMapping: any = {};
    for (let i = 0; i < this.servers.length; i++) {
      for (let k = 0; k < this.virtualNodeFactor; k++) {
        let nodeString = (k + 1) * k + ' ' + this.servers[i] + ' ' + k * k;
        let hashCode = Math.abs(this.stringHash(nodeString));
        let ringVal = hashCode % (this.ringSize + 1);
        ringMapping[ringVal] = this.servers[i];
      }
    }
    console.log(ringMapping);

    let mappedIndices = Object.keys(ringMapping).map((val) => Number(val));
    mappedIndices.sort((a, b) => a - b);

    this.ringServerList = [];
    this.serverRingMap = {};

    let mappedIndexCount = 0;
    let reachedEnd = false;
    for (let i = 0; i < this.ringSize; i++) {
      if (mappedIndices[mappedIndexCount] < i) {
        mappedIndexCount++;
        if(mappedIndexCount >= mappedIndices.length) {
          reachedEnd = true;
        }
        if(reachedEnd) {
          mappedIndexCount = 0;
        }
      }
      this.ringServerList[i] = ringMapping[mappedIndices[mappedIndexCount]];
      if (!this.serverRingMap[this.ringServerList[i]]) {
        this.serverRingMap[this.ringServerList[i]] = [];
      }
      this.serverRingMap[this.ringServerList[i]].push(i);
    }

  }

  stringHash(input: string) {
    let hash = 0;
    if (input.length === 0) return hash;
    for (let i = 0; i < input.length; i++) {
      let chr = input.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
}
