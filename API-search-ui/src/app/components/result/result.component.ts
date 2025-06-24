import {Component, inject, Input, OnDestroy, OnInit, signal} from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import {SearchService} from '../../services/search.service';
import {result} from '../../model/result.type';
import {catchError, ObservableInput, Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-result',
  imports: [],
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})

// on init samo za testiranje

export class ResultComponent implements OnInit, OnDestroy {
  // searchService = inject(SearchService)
  private destroy$ = new Subject<void>();
  results: result[] = [];
  searchItems = signal<Array<result>>([]);
  @Input() viewSignal!: Signal<string>;

  constructor(private searchService: SearchService) {}

  ngOnInit() {

    if (this.viewSignal == null) {
      this.viewSignal = signal('search');
      this.searchService.searchResults$
        .pipe(takeUntil(this.destroy$))
        .subscribe(results => {
          this.results = results;
          console.log('Received search results:', results);
          this.searchItems.set(results);
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
