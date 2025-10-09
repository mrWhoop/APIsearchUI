import {Component, inject, Input, OnDestroy, OnInit, signal} from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import {SearchService} from '../../services/search.service';
import {result} from '../../model/result.type';
import {catchError, ObservableInput, Subject, takeUntil} from 'rxjs';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-result',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})

// on init samo za testiranje

export class ResultComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  results: result[] = [];

  @Input() searchItems = signal<Array<result>>([]);
  @Input() GPTsummary = signal('');
  @Input() GeminiSummary = signal('');
  @Input() viewSignal!: Signal<string>;
  @Input() selectedAI: Signal<string> | undefined;

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
      this.searchService.GPTsummary$
        .pipe(takeUntil(this.destroy$))
        .subscribe(summary => {
          this.GPTsummary.set(summary);
        });

      this.searchService.GeminiSummary$
        .pipe(takeUntil(this.destroy$))
        .subscribe(summary => {
          this.GeminiSummary.set(summary);
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
