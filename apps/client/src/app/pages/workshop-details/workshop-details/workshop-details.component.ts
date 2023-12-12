import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkshopsFacade } from '../../../modules/workshop/+state/workshops.facade';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { Workshop } from '../../../model/other/workshop';
import { Observable, of } from 'rxjs';
import { catchError, filter, first, map, switchMap, tap } from 'rxjs/operators';
import { List } from '../../../modules/list/model/list';
import { Character } from '@xivapi/angular-client';
import { UserService } from '../../../core/database/user.service';
import { LodestoneService } from '../../../core/api/lodestone.service';
import { TranslateModule } from '@ngx-translate/core';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { ListPanelComponent } from '../../../modules/list/list-panel/list-panel.component';
import { NgForTrackByKeyDirective } from '../../../core/track-by/ng-for-track-by-key.directive';
import { FavoriteButtonComponent } from '../../../modules/favorites/favorite-button/favorite-button.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-workshop-details',
    templateUrl: './workshop-details.component.html',
    styleUrls: ['./workshop-details.component.less'],
    standalone: true,
    imports: [NgIf, NzCardModule, NzAvatarModule, FlexModule, FavoriteButtonComponent, NgFor, NgForTrackByKeyDirective, ListPanelComponent, FullpageMessageComponent, PageLoaderComponent, AsyncPipe, TranslateModule]
})
export class WorkshopDetailsComponent {

  public workshop$: Observable<Workshop> = this.workshopsFacade.selectedWorkshop$.pipe(
    filter(w => w !== undefined),
    tap(workshop => {
      if (!workshop.notFound) {
        workshop.listIds.forEach(listId => this.listsFacade.load(listId));
      }
    })
  );

  public author$: Observable<Partial<Character>> = this.workshop$.pipe(
    filter(workshop => !workshop.notFound),
    switchMap(workshop => {
      return this.userService.get(workshop.authorId).pipe(
        catchError(() => of(null))
      );
    }),
    switchMap(user => {
      if (user && user.defaultLodestoneId) {
        return this.characterService.getCharacter(user.defaultLodestoneId)
          .pipe(
            map(response => response.Character)
          );
      }
      return of({
        Name: 'COMMON.Anonymous'
      });
    })
  );

  public lists$: Observable<List[]> = this.workshop$.pipe(
    filter(workshop => !workshop.notFound),
    switchMap(workshop => {
      return this.listsFacade.getWorkshopLists(workshop.listIds);
    }),
    map(lists => lists.filter(list => list !== undefined && !list.notFound && list.name))
  );

  constructor(private route: ActivatedRoute, private workshopsFacade: WorkshopsFacade,
              private listsFacade: ListsFacade,
              private userService: UserService, private characterService: LodestoneService) {
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter(key => key !== undefined),
      first()
    ).subscribe(key => {
      this.workshopsFacade.loadWorkshop(key);
      this.workshopsFacade.selectWorkshop(key);
    });
  }

}
