import {inject, Injectable} from '@angular/core';
import {result} from '../model/result.type';
import {HttpClient, HttpParams} from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged, map,
  Observable,
  of,
  Subject,
  switchMap,
  tap
} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class SearchService {
  http = inject(HttpClient)
  private readonly baseUrl = 'http://127.0.0.1:5000';

  private searchResultsSubject = new BehaviorSubject<result[]>([]);
  public searchResults$ = this.searchResultsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  private searchQuerySubject = new Subject<string>();

  constructor() {
    this.initializeSearchStream();
  }

  private initializeSearchStream(): void {
    this.searchQuerySubject.pipe(
      debounceTime(1000),
      distinctUntilChanged(), // Only emit if query is different
      tap(() => {
        this.loadingSubject.next(true);
        this.errorSubject.next(null);
      }),
      switchMap(query => this.searchAPI(query))
    ).subscribe();
  }

  search(query: string): void {
    if (query.trim()) {
      this.searchQuerySubject.next(query.trim());
    } else {
      this.clearResults();
    }
  }

  private searchAPI(query: string){
    if (!query.trim()) {
      this.searchResultsSubject.next([]);
      this.loadingSubject.next(false);
      return of([]);
    }

    let params = new HttpParams().set("q", query);


    let rez = this.http.get<{results: result[]}>(`${this.baseUrl}/search`, { params })
      .pipe(
        tap(response => {
          this.searchResultsSubject.next(response.results);
          this.loadingSubject.next(false);
          this.errorSubject.next(null);
        }),
        map(response => response.results),
        catchError(error => {
          this.loadingSubject.next(false);
          this.errorSubject.next('Search failed. Please try again.');
          this.searchResultsSubject.next([]);
          console.error('Search error:', error);
          return of([]);
        })
      );

      console.log(rez)

      return rez;
  }

  // Clear search results
  clearResults(): void {
    this.searchResultsSubject.next([]);
    this.loadingSubject.next(false);
    this.errorSubject.next(null);
  }

  // Get current results synchronously
  getCurrentResults(): result[] {
    return this.searchResultsSubject.value;
  }

}
