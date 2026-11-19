import {inject, Injectable} from '@angular/core';
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

interface SelectedItem {
  id: string;
  position: number;
}

interface SelectedItems {
  query: string;
  component: string;
  accepted: SelectedItem[];
  rejected: SelectedItem[];
}

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {

  private readonly baseUrl = 'http://127.0.0.1:5000';
  private readonly evaluationScenario = 'search' // search | simulate-search
  private readonly selectedScenario = 'selected' // selected | simulate-selected

  private selectedIdsSubject = new BehaviorSubject<Set<string>>(new Set());
  public selectedIds$ = this.selectedIdsSubject.asObservable();

  private searchQuerySubject = new BehaviorSubject<string>('');
  public searchQuery$ = this.searchQuerySubject.asObservable();

  private searchResultsSubjectGPT = new BehaviorSubject<result[]>([]);
  public searchResultsGPT$ = this.searchResultsSubjectGPT.asObservable();

  private searchResultsSubjectMeili = new BehaviorSubject<result[]>([]);
  public searchResultsMeili$ = this.searchResultsSubjectMeili.asObservable();

  private searchResultsSubjectGemini = new BehaviorSubject<result[]>([]);
  public searchResultsGemini$ = this.searchResultsSubjectGemini.asObservable();

  private searchResultsSubjectGPTMeta = new BehaviorSubject<result[]>([]);
  public searchResultsGPTMeta$ = this.searchResultsSubjectGPTMeta.asObservable();

  private searchResultsSubjectMeiliEmm = new BehaviorSubject<result[]>([]);
  public searchResultsMeiliEmm$ = this.searchResultsSubjectMeiliEmm.asObservable();

  private searchResultsSubjectGeminiMeta = new BehaviorSubject<result[]>([]);
  public searchResultsGeminiMeta$ = this.searchResultsSubjectGeminiMeta.asObservable();

  private searchResultsSubjectGPTDesc = new BehaviorSubject<result[]>([]);
  public searchResultsGPTDesc$ = this.searchResultsSubjectGPTDesc.asObservable();

  private searchResultsSubjectGeminiDesc = new BehaviorSubject<result[]>([]);
  public searchResultsGeminiDesc$ = this.searchResultsSubjectGeminiDesc.asObservable();

  private searchResultsSubjectGPTPrompt = new BehaviorSubject<result[]>([]);
  public searchResultsGPTPrompt$ = this.searchResultsSubjectGPTPrompt.asObservable();

  private searchResultsSubjectGeminiPrompt = new BehaviorSubject<result[]>([]);
  public searchResultsGeminiPrompt$ = this.searchResultsSubjectGeminiPrompt.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  private markedIdSubject = new BehaviorSubject<string | null>(null);
  public markedId$ = this.markedIdSubject.asObservable();

  private searchQuerySubjectGPT = new Subject<string>();
  private searchQuerySubjectMeili = new Subject<string>();
  private searchQuerySubjectGemini = new Subject<string>();
  private searchQuerySubjectGPTMeta = new Subject<string>();
  private searchQuerySubjectMeiliEmm = new Subject<string>();
  private searchQuerySubjectGeminiMeta = new Subject<string>();
  private searchQuerySubjectGPTDesc = new Subject<string>();
  private searchQuerySubjectGeminiDesc = new Subject<string>();
  private searchQuerySubjectGPTPrompt = new Subject<string>();
  private searchQuerySubjectGeminiPrompt = new Subject<string>();

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

    this.searchQuerySubjectGPTMeta.pipe(
      debounceTime(1000),
      distinctUntilChanged(), // Only emit if query is different
      tap(() => {
        this.loadingSubject.next(true);
        this.errorSubject.next(null);
      }),
      switchMap((query) => this.getGPTMetasearch(query))
    ).subscribe();

    this.searchQuerySubjectMeiliEmm.pipe(
      debounceTime(1000),
      distinctUntilChanged(), // Only emit if query is different
      tap(() => {
        this.loadingSubject.next(true);
        this.errorSubject.next(null);
      }),
      switchMap((query) => this.getMeiliSearchEmmSearch(query))
    ).subscribe();

    this.searchQuerySubjectGeminiMeta.pipe(
      debounceTime(1000),
      distinctUntilChanged(), // Only emit if query is different
      tap(() => {
        this.loadingSubject.next(true);
        this.errorSubject.next(null);
      }),
      switchMap((query) => this.getGeminiMetaSearch(query))
    ).subscribe();

    this.searchQuerySubjectGPTDesc.pipe(
      debounceTime(1000),
      distinctUntilChanged(), // Only emit if query is different
      tap(() => {
        this.loadingSubject.next(true);
        this.errorSubject.next(null);
      }),
      switchMap((query) => this.getGPTDescsearch(query))
    ).subscribe();

    this.searchQuerySubjectGeminiDesc.pipe(
      debounceTime(1000),
      distinctUntilChanged(), // Only emit if query is different
      tap(() => {
        this.loadingSubject.next(true);
        this.errorSubject.next(null);
      }),
      switchMap((query) => this.getGeminiDescSearch(query))
    ).subscribe();

    this.searchQuerySubjectGPTPrompt.pipe(
      debounceTime(1000),
      distinctUntilChanged(), // Only emit if query is different
      tap(() => {
        this.loadingSubject.next(true);
        this.errorSubject.next(null);
      }),
      switchMap((query) => this.getGPTPromptsearch(query))
    ).subscribe();

    this.searchQuerySubjectGeminiPrompt.pipe(
      debounceTime(1000),
      distinctUntilChanged(), // Only emit if query is different
      tap(() => {
        this.loadingSubject.next(true);
        this.errorSubject.next(null);
      }),
      switchMap((query) => this.getGeminiPromptSearch(query))
    ).subscribe();
  }

  resetEvaluationState(): void {
    this.selectedIdsSubject.next(new Set<string>());
    this.markedIdSubject.next(null);
  }

  search(query: string): void {
    if (!query.trim()) {
      this.clearResults();
      this.resetEvaluationState();
      return;
    }

    this.resetEvaluationState();

    this.searchQuerySubject.next(query.trim());

    this.searchQuerySubjectGPT.next(query.trim());
    this.searchQuerySubjectMeili.next(query.trim());
    this.searchQuerySubjectGemini.next(query.trim());
    this.searchQuerySubjectGPTMeta.next(query.trim());
    this.searchQuerySubjectMeiliEmm.next(query.trim());
    this.searchQuerySubjectGeminiMeta.next(query.trim());
    this.searchQuerySubjectGPTDesc.next(query.trim());
    this.searchQuerySubjectGeminiDesc.next(query.trim());
    this.searchQuerySubjectGPTPrompt.next(query.trim());
    this.searchQuerySubjectGeminiPrompt.next(query.trim());

  }

  getGPTsearch(query: string): Observable<any> {
    let params = new HttpParams().set("q", query).set("ai", "GPT");
    let rez = this.http.get<{results: result[]}>(`${this.baseUrl}/${this.evaluationScenario}`, { params }).pipe(
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
    let rez = this.http.get<{results: result[]}>(`${this.baseUrl}/${this.evaluationScenario}`, { params }).pipe(
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
    let params = new HttpParams().set("q", query).set("ai", "Gemini");
    let rez = this.http.get<{results: result[]}>(`${this.baseUrl}/${this.evaluationScenario}`, { params }).pipe(
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

  getGPTMetasearch(query: string): Observable<any> {
    let params = new HttpParams().set("q", query).set("ai", "GPTmeta");
    let rez = this.http.get<{results: result[]}>(`${this.baseUrl}/${this.evaluationScenario}`, { params }).pipe(
      tap(response => {
        this.searchResultsSubjectGPTMeta.next(response.results);
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
      }),
      map(response => response.results),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next('Search failed. Please try again.');
        this.searchResultsSubjectGPTMeta.next([]);
        console.error('Search error:', error);
        return of([]);
      })
    );

    return rez

  }

  getMeiliSearchEmmSearch(query: string): Observable<any> {
    let params = new HttpParams().set("q", query).set("ai", "MeiliSearchEmm");
    let rez = this.http.get<{results: result[]}>(`${this.baseUrl}/${this.evaluationScenario}`, { params }).pipe(
      tap(response => {
        this.searchResultsSubjectMeiliEmm.next(response.results);
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
      }),
      map(response => response.results),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next('Search failed. Please try again.');
        this.searchResultsSubjectMeiliEmm.next([]);
        console.error('Search error:', error);
        return of([]);
      })
    );

    return rez
  }

  getGeminiMetaSearch(query: string): Observable<any> {
    let params = new HttpParams().set("q", query).set("ai", "Geminimeta");
    let rez = this.http.get<{results: result[]}>(`${this.baseUrl}/${this.evaluationScenario}`, { params }).pipe(
      tap(response => {
        this.searchResultsSubjectGeminiMeta.next(response.results);
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
      }),
      map(response => response.results),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next('Search failed. Please try again.');
        this.searchResultsSubjectGeminiMeta.next([]);
        console.error('Search error:', error);
        return of([]);
      })
    );

    return rez
  }

  getGPTDescsearch(query: string): Observable<any> {
    let params = new HttpParams().set("q", query).set("ai", "GPTdesc"); //
    let rez = this.http.get<{results: result[]}>(`${this.baseUrl}/${this.evaluationScenario}`, { params }).pipe(
      tap(response => {
        this.searchResultsSubjectGPTDesc.next(response.results);
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
      }),
      map(response => response.results),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next('Search failed. Please try again.');
        this.searchResultsSubjectGPTDesc.next([]);
        console.error('Search error:', error);
        return of([]);
      })
    );

    return rez

  }

  getGeminiDescSearch(query: string): Observable<any> {
    let params = new HttpParams().set("q", query).set("ai", "Geminidesc");
    let rez = this.http.get<{results: result[]}>(`${this.baseUrl}/${this.evaluationScenario}`, { params }).pipe(
      tap(response => {
        this.searchResultsSubjectGeminiDesc.next(response.results);
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
      }),
      map(response => response.results),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next('Search failed. Please try again.');
        this.searchResultsSubjectGeminiDesc.next([]);
        console.error('Search error:', error);
        return of([]);
      })
    );

    return rez
  }

  getGPTPromptsearch(query: string): Observable<any> {
    let params = new HttpParams().set("q", query).set("ai", "GPTprompt");
    let rez = this.http.get<{results: result[]}>(`${this.baseUrl}/${this.evaluationScenario}`, { params }).pipe(
      tap(response => {
        this.searchResultsSubjectGPTPrompt.next(response.results);
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
      }),
      map(response => response.results),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next('Search failed. Please try again.');
        this.searchResultsSubjectGPTPrompt.next([]);
        console.error('Search error:', error);
        return of([]);
      })
    );

    return rez

  }

  getGeminiPromptSearch(query: string): Observable<any> {
    let params = new HttpParams().set("q", query).set("ai", "Geminiprompt");
    let rez = this.http.get<{results: result[]}>(`${this.baseUrl}/${this.evaluationScenario}`, { params }).pipe(
      tap(response => {
        this.searchResultsSubjectGeminiPrompt.next(response.results);
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
      }),
      map(response => response.results),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next('Search failed. Please try again.');
        this.searchResultsSubjectGeminiPrompt.next([]);
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
    this.searchResultsSubjectGPTMeta.next([]);
    this.searchResultsSubjectMeiliEmm.next([]);
    this.searchResultsSubjectGeminiMeta.next([]);
    this.searchResultsSubjectGPTDesc.next([]);
    this.searchResultsSubjectGeminiDesc.next([]);
    this.searchResultsSubjectGPTPrompt.next([]);
    this.searchResultsSubjectGeminiPrompt.next([]);
    this.loadingSubject.next(false);
    this.errorSubject.next(null);
  }

  getSelectedIds(): Set<string> {
    return this.selectedIdsSubject.value;
  }

  setSelectedIds(ids: Set<string>): void {
    this.selectedIdsSubject.next(ids);
  }

  getMarkedId(): string | null {
    return this.markedIdSubject.value;
  }

  setMarkedId(id: string | null): void {
    this.markedIdSubject.next(id);
  }

  submitSelected(data: SelectedItems) {
    return this.http.post(`${this.baseUrl}/${this.selectedScenario}`, data);
  }
}
