import {List} from '../../model/list/list';
import {Injectable} from '@angular/core';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {Observable} from 'rxjs/Observable';
import {ListStore} from './storage/list/list-store';
import {Workshop} from '../../model/other/workshop';
import 'rxjs/add/operator/catch';

@Injectable()
export class ListService {

    constructor(protected store: ListStore,
                protected serializer: NgSerializerService) {
    }

    /**
     * Gets a list by its uid.
     * @param {string} uid
     * @returns {Observable<List>}
     */
    public get(uid: string): Observable<List> {
        return this.store.get(uid);
    }

    /**
     * Gets all public lists in the database.
     * @returns {Observable<List[]>}
     */
    public getPublicLists(): Observable<List[]> {
        return this.store.getPublicLists();
    }

    /**
     * Gets all public lists for a given author id.
     * @param {string} uid
     * @returns {Observable<List[]>}
     */
    public getPublicListsByAuthor(uid: string): Observable<List[]> {
        return this.store.getPublicListsByAuthor(uid);
    }

    /**
     * Updates a list in the database.
     * @param {string} uid
     * @param {List} data
     * @returns {Observable<void>}
     */
    public update(uid: string, data: List): Observable<void> {
        return this.store.update(uid, data);
    }

    /**
     * Sets a list in the database, overriding all previous data.
     * @param {string} uid
     * @param {List} data
     * @returns {Observable<void>}
     */
    public set(uid: string, data: List): Observable<void> {
        return this.store.set(uid, data);
    }

    /**
     * Removes a given list.
     * @param {string} uid
     * @returns {Observable<void>}
     */
    public remove(uid: string): Observable<void> {
        return this.store.remove(uid);
    }

    /**
     * Gets the router path for a given list-details (useful to share lists)
     * @param uid The uid of the list-details
     * @returns {Observable<R>}
     */
    public getRouterPath(uid: string): Observable<string[]> {
        return Observable.of(['list', uid]);
    }

    /**
     * Returns all the lists created by a given user based on his id.
     * @param {string} userId
     * @returns {Observable<List[]>}
     */
    public getUserLists(userId: string): Observable<List[]> {
        return this.store.byAuthor(userId);
    }

    /**
     * Delete all lists of a given user.
     * @param {string} uid
     * @returns {Promise<void>}
     */
    public deleteUserLists(uid: string): Observable<void> {
        return this.store.deleteByAuthor(uid);
    }

    /**
     * Fetches all lists of a given workshop.
     * @param {Workshop} workshop
     * @returns {Observable<List[]>}
     */
    public fetchWorkshop(workshop: Workshop): Observable<List[]> {
        if (workshop.listIds.length === 0) {
            return Observable.of([]);
        }
        return Observable.combineLatest(workshop.listIds.map(listId => this.get(listId).catch(() => Observable.of(null))))
            .map(lists => lists.filter(l => l !== null));
    }

    public add(list: List): Observable<string> {
        if (list.authorId === undefined) {
            throw new Error('Tried to persist a list with no author ID');
        }
        return this.store.add(list);
    }
}
