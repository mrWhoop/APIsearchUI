import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of, Subject,
  switchMap,
  tap
} from 'rxjs';
import {result} from '../model/result.type';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {

  private readonly baseUrl = 'http://127.0.0.1:5000';

  private searchResultsSubjectGPT = new BehaviorSubject<result[]>([]);
  public searchResultsGPT$ = this.searchResultsSubjectGPT.asObservable();

  private searchResultsSubjectMeili = new BehaviorSubject<result[]>([]);
  public searchResultsMeili$ = this.searchResultsSubjectMeili.asObservable();

  private searchResultsSubjectGemini = new BehaviorSubject<result[]>([]);
  public searchResultsGemini$ = this.searchResultsSubjectGemini.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  private searchQuerySubjectGPT = new Subject<string>();
  private searchQuerySubjectMeili = new Subject<string>();
  private searchQuerySubjectGemini = new Subject<string>();

  constructor(private http: HttpClient) {
    this.initializeSearchStream()
  }

  private initializeSearchStream(): void {
    this.searchQuerySubjectGPT.pipe(
      debounceTime(1000),
      distinctUntilChanged(), // Only emit if query is different
      tap(() => {
        this.loadingSubject.next(true);
        this.errorSubject.next(null);
      }),
      switchMap((query) => this.getGPTsearch(query))
    ).subscribe();

    this.searchQuerySubjectMeili.pipe(
      debounceTime(1000),
      distinctUntilChanged(), // Only emit if query is different
      tap(() => {
        this.loadingSubject.next(true);
        this.errorSubject.next(null);
      }),
      switchMap((query) => this.getMeiliSearchSearch(query))
    ).subscribe();

    this.searchQuerySubjectGemini.pipe(
      debounceTime(1000),
      distinctUntilChanged(), // Only emit if query is different
      tap(() => {
        this.loadingSubject.next(true);
        this.errorSubject.next(null);
      }),
      switchMap((query) => this.getGeminiSearch(query))
    ).subscribe();

  }

  search(query: string): void {
    if (query.trim()) {
      this.searchQuerySubjectGPT.next(query.trim());
      this.searchQuerySubjectMeili.next(query.trim());
      this.searchQuerySubjectGemini.next(query.trim());
    } else {
      this.clearResults();
    }
  }

  getGPTsearch(query: string): Observable<any> {
    let params = new HttpParams().set("q", query).set("ai", "GPTdesc"); // GPT | GPTmeta | GPTprompt | GPTdesc
    let rez = this.http.get<{results: result[]}>(`${this.baseUrl}/search`, { params }).pipe(
      tap(response => {
        this.searchResultsSubjectGPT.next(response.results);
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
      }),
      map(response => response.results),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next('Search failed. Please try again.');
        this.searchResultsSubjectGPT.next([]);
        console.error('Search error:', error);
        return of([]);
      })
    );

    return rez

  }

  getMeiliSearchSearch(query: string): Observable<any> {
    let params = new HttpParams().set("q", query).set("ai", "MeiliSearch");
    let rez = this.http.get<{results: result[]}>(`${this.baseUrl}/search`, { params }).pipe(
      tap(response => {
        this.searchResultsSubjectMeili.next(response.results);
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
      }),
      map(response => response.results),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next('Search failed. Please try again.');
        this.searchResultsSubjectMeili.next([]);
        console.error('Search error:', error);
        return of([]);
      })
    );

    return rez
  }

  getGeminiSearch(query: string): Observable<any> {
    let params = new HttpParams().set("q", query).set("ai", "Geminidesc"); // Gemini | Geminimeta | Geminiprompt | Geminidesc
    let rez = this.http.get<{results: result[]}>(`${this.baseUrl}/search`, { params }).pipe(
      tap(response => {
        this.searchResultsSubjectGemini.next(response.results);
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
      }),
      map(response => response.results),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next('Search failed. Please try again.');
        this.searchResultsSubjectGemini.next([]);
        console.error('Search error:', error);
        return of([]);
      })
    );

    return rez
  }

  getServiceName(): string {
    return 'EvaluationService';
  }

  clearResults(): void {
    this.searchResultsSubjectGPT.next([]);
    this.searchResultsSubjectMeili.next([]);
    this.searchResultsSubjectGemini.next([]);
    this.loadingSubject.next(false);
    this.errorSubject.next(null);
  }

}
