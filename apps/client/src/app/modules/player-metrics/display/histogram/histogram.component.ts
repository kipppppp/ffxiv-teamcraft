import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractMetricDisplayComponent } from '../abstract-metric-display-component';
import { map } from 'rxjs/operators';
import { SettingsService } from '../../../settings/settings.service';
import { EChartsOption } from 'echarts';
import { Observable } from 'rxjs';
import { formatDate, AsyncPipe } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NgxEchartsModule } from 'ngx-echarts';

@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgxEchartsModule, NzEmptyModule, AsyncPipe, TranslateModule]
})
export class HistogramComponent extends AbstractMetricDisplayComponent {

  options$: Observable<EChartsOption> = this.data$.pipe(
    map(reports => {
      return {
        backgroundColor: '#292929',
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            params = params[0];
            const date = new Date(params.value[0]);
            return `${formatDate(date, 'medium', this.translate.currentLang)}: ${params.value[1]}`;
          },
          axisPointer: {
            animation: false
          }
        },
        xAxis: {
          type: 'time'
        },
        yAxis: {
          type: 'value'
        },
        dataset: {
          source: reports.map(report => {
            return [
              new Date(report.timestamp * 1000),
              report.data[1]
            ];
          }).sort(([a]: [Date], [b]: [Date]) => a.getTime() - b.getTime()),
          dimensions: ['timestamp', 'value']
        },
        series: [
          {
            name: 'timestamp',
            type: 'line',
            encode: {
              x: 'timestamp',
              y: 'value'
            }
          }
        ]
      };
    })
  );

  constructor(public settings: SettingsService, private translate: TranslateService) {
    super();
  }
}
