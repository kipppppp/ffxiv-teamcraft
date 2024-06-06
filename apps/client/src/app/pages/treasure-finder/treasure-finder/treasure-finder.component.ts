import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { MapMarker } from '../../../modules/map/map-marker';
import { MapService } from '../../../modules/map/map.service';
import { uniq } from 'lodash';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { MapComponent } from '../../../modules/map/map/map.component';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AsyncPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-treasure-finder',
    templateUrl: './treasure-finder.component.html',
    styleUrls: ['./treasure-finder.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NzButtonModule, NzWaveModule, MapComponent, NzGridModule, NzFormModule, NzSelectModule, FormsModule, AsyncPipe, I18nPipe, TranslateModule, I18nRowPipe, ItemNamePipe]
})
export class TreasureFinderComponent {

  map$: ReplaySubject<number> = new ReplaySubject<number>();

  treasureItemId$: ReplaySubject<number> = new ReplaySubject<number>();

  selectedTreasure$: ReplaySubject<any> = new ReplaySubject<any>();

  maps$ = combineLatest([
    this.lazyData.getEntry('maps'),
    this.lazyData.getEntry('treasures')
  ]).pipe(
    map(([maps, treasures]) => {
      return Object.values(maps).filter(row => {
        return treasures.some(t => t.map === row.id);
      });
    })
  );

  treasures$: Observable<any[]> = combineLatest([
    this.map$,
    this.lazyData.getEntry('treasures'),
    this.lazyData.getEntry('maps')
  ]).pipe(
    map(([mapId, treasures, maps]) => {
      return treasures
        .filter(t => t.map === mapId)
        .map(treasure => {
          const mapData = maps[treasure.map];
          const coordsPercent = this.mapService.getPositionPercentOnMap(mapData, treasure.coords);
          const offsetX = 109 * 0.9;
          const offsetY = 94.5 * 0.9;
          return {
            ...treasure,
            mapImage: mapData.image,
            coordsPercent,
            display: {
              x: -(treasure.rawCoords.x + 1024) + offsetX,
              y: -(treasure.rawCoords.y + 1024) + offsetY
            }
          };
        });
    })
  );

  treasureItemIds$ = this.treasures$.pipe(
    map(treasures => {
      return uniq(treasures.map(t => t.item));
    })
  );

  possibleTreasureMaps$ = combineLatest([this.treasures$, this.treasureItemId$]).pipe(
    map(([treasures, itemId]) => {
      return itemId === -1 ? treasures : treasures.filter(t => t.item === itemId);
    })
  );


  markers$: Observable<MapMarker[]> = this.selectedTreasure$.pipe(
    filter(t => t !== null),
    map(treasure => {
      return [{
        ...treasure.coords,
        iconType: 'img',
        iconImg: './assets/icons/treasure_marker.png',
        tooltip: `X: ${treasure.coords.x}, Y: ${treasure.coords.y}`
      }];
    })
  );

  constructor(private lazyData: LazyDataFacade, private mapService: MapService) {
  }

}
