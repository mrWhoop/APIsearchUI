import { Component } from '@angular/core';
import {Subject, takeUntil} from 'rxjs';
import {result} from '../../model/result.type';
import {SearchService} from '../../services/search.service';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-search',
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  private destroy$ = new Subject<void>();

  searchQuery: string = '';
  loading: boolean = false;
  error: string | null = null;
  results: result[] = [];

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    // Subscribe to loading state
    this.searchService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
      });

    // Subscribe to error state
    this.searchService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.error = error;
      });

    // Subscribe to search results (for count display)
    this.searchService.searchResults$
      .pipe(takeUntil(this.destroy$))
      .subscribe(results => {
        this.results = results;
      });
  }

  onSearchInput(event: any): void {
    const query = event.target.value;
    this.searchQuery = query;

    if (query.trim()) {
      this.searchService.search(this.searchQuery);
    } else {
      this.searchService.clearResults();
    }
  }

  performSearch(): void {
    if (this.searchQuery.trim()) {
      this.searchService.search(this.searchQuery);
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchService.clearResults();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
