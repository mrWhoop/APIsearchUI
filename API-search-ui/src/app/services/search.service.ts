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
  switchMap,
  tap
} from 'rxjs';

interface SummaryRequest {
  ids: string[];
  searchQuery: string;
}

@Injectable({
  providedIn: 'root'
})

export class SearchService {

  private readonly evaluationScenario = 'search' // search | simulate-search
  private readonly evaluationGPTScenario = 'gpt-summary' // gpt-summary | simulate-gpt-summary
  private readonly evaluationGeminiScenario = 'gemini-summary' // gemini-summary | simulate-gemini-summary
  private readonly selectedScenario = 'compare-eval' // compare-eval | simulate-compare-eval

  http = inject(HttpClient)
  private readonly baseUrl = 'http://127.0.0.1:5000';

  private searchResultsSubject = new BehaviorSubject<result[]>([]);
  public searchResults$ = this.searchResultsSubject.asObservable();

  private GPTsummarySubject = new BehaviorSubject<string>('');
  public GPTsummary$ = this.GPTsummarySubject.asObservable();

  private GeminiSummarySubject = new BehaviorSubject<string>('');
  public GeminiSummary$ = this.GeminiSummarySubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  private searchQuerySubject = new BehaviorSubject<string>('');
  public searchQuery$ = this.searchQuerySubject.asObservable();

  private gptSummaryRequest$ = new BehaviorSubject<SummaryRequest | null>(null);

  private geminiSummaryRequest$ = new BehaviorSubject<SummaryRequest | null>(null);

  constructor() {
    this.initializeSearchStream();
    this.initializeSummaryStreams();
  }

  private initializeSearchStream(): void {
    this.searchQuerySubject.pipe(
      debounceTime(1000),
      distinctUntilChanged(), // Only emit if query is different
      tap(() => {
        this.loadingSubject.next(true);
        this.errorSubject.next(null);
        this.GPTsummarySubject.next('');
        this.GeminiSummarySubject.next('');
        this.searchResultsSubject.next([]);
      }),
      switchMap((query) => this.searchAPI(query))
    ).subscribe();
  }

  private initializeSummaryStreams(): void {
    this.gptSummaryRequest$.pipe(
      switchMap(request => {
        if (request === null) {
          return of(null);
        }

        return this.http.post<{ summary: string }>(
          `${this.baseUrl}/${this.evaluationGPTScenario}`, request
        ).pipe(
          map(response => response.summary ?? ''),
          catchError(error => {
            console.error('GPT summary error:', error);
            return of('');
          })
        );
      })
    ).subscribe(summary => {
      if (summary !== null) {
        this.GPTsummarySubject.next(summary);
      }
    });

    this.geminiSummaryRequest$.pipe(
      switchMap(request => {
        if (request === null) {
          return of(null);
        }

        return this.http.post<{ summary: string }>(
          `${this.baseUrl}/${this.evaluationGeminiScenario}`, request
        ).pipe(
          map(response => response.summary ?? ''),
          catchError(error => {
            console.error('Gemini summary error:', error);
            return of('');
          })
        );
      })
    ).subscribe(summary => {
      if (summary !== null) {
        this.GeminiSummarySubject.next(summary);
      }
    });
  }

  search(query: string): void {
    if (query.trim()) {

      this.gptSummaryRequest$.next(null);
      this.geminiSummaryRequest$.next(null);

      this.GPTsummarySubject.next('');
      this.GeminiSummarySubject.next('');

      this.searchQuerySubject.next(query.trim());
    } else {
      this.clearResults();
    }
  }

  private searchAPI(query: string){
    if (!query.trim()) {
      this.searchResultsSubject.next([]);
      this.GPTsummarySubject.next('');
      this.GeminiSummarySubject.next('');
      this.loadingSubject.next(false);
      return of([]);
    }

    const params = new HttpParams().set('q', query);


    return this.http.get<{
      results: result[];
      }>(`${this.baseUrl}/${this.evaluationScenario}`, { params })
        .pipe(
          tap(response => {
            this.searchResultsSubject.next(response.results);

            this.GPTsummarySubject.next('');
            this.GeminiSummarySubject.next('');

            this.loadingSubject.next(false);
            this.errorSubject.next(null);

            const ids = response.results.map(item => item.id);

            if (ids.length > 0) {

              const request: SummaryRequest = {
                ids,
                searchQuery: query
              };

              this.gptSummaryRequest$.next(request);
              this.geminiSummaryRequest$.next(request);
            }
          }),

          map(response => response.results),

          catchError(error => {
            this.loadingSubject.next(false);
            this.errorSubject.next('Search failed. Please try again.');
            this.searchResultsSubject.next([]);
            this.GPTsummarySubject.next('');
            this.GeminiSummarySubject.next('');
            console.error('Search error:', error);
            return of([]);
          })
        );
  }

  // Clear search results
  clearResults(): void {

    this.searchQuerySubject.next('');

    this.searchResultsSubject.next([]);
    this.GPTsummarySubject.next('');
    this.GeminiSummarySubject.next('');
    this.loadingSubject.next(false);
    this.errorSubject.next(null);
  }

  submitCompareEvaluation(data: {
    query: string;
    model: 'GPT' | 'Gemini';
    summary: string;
    grades: {
      fluency: number,
      groundness: number,
      faithfulness: number
    };
    resultIds: {
      id: string;
      position: number;
    }[]
  }) {
    return this.http.post(
      `${this.baseUrl}/${this.selectedScenario}`,
      data
    );
  }

  // Get current results synchronously
  getCurrentResults(): result[] {
    return this.searchResultsSubject.value;
  }

  getServiceName(): string {
    return 'SearchService';
  }

}
