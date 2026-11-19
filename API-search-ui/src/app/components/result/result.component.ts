import {Component, inject, Input, OnDestroy, OnInit, signal} from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import {SearchService} from '../../services/search.service';
import {result} from '../../model/result.type';
import {catchError, ObservableInput, Subject, takeUntil} from 'rxjs';
import {NgOptimizedImage} from '@angular/common';
import {EvaluationService} from '../../services/evaluation.service';
import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

interface SelectedItem {
  id: string;
  position: number;
}

interface SelectedItems {
  query: string;
  component: string;
  accepted: SelectedItem[];
  rejected: SelectedItem[];
  marked: SelectedItem | null;
}

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
  private sanitizer = inject(DomSanitizer);
  private destroy$ = new Subject<void>();
  results: result[] = [];
  searchQuery = '';

  @Input() searchItems = signal<Array<result>>([]);
  @Input() GPTsummary = signal('');
  @Input() GeminiSummary = signal('');
  @Input() viewSignal!: Signal<string>;
  @Input() selectedAI: Signal<string> | undefined;
  @Input() resultComponent = '';

  GPTgrades = signal({
    fluency: 0,
    groundness: 0,
    faithfulness: 0
  });

  GeminiGrades = signal({
    fluency: 0,
    groundness: 0,
    faithfulness: 0
  });

  GPTsubmitted = false;
  GeminiSubmitted = false;


  updateGPTGrade(
    criterion: 'fluency' | 'groundness' | 'faithfulness',
    value: number
  ): void {
    const grades = this.GPTgrades();

    if (grades[criterion] !== value) {
      this.GPTgrades.set(Object.assign({}, grades, {
        [criterion]: value
      }));

      this.GPTsubmitted = false;
    }
  }

  updateGeminiGrade(
    criterion: 'fluency' | 'groundness' | 'faithfulness',
    value: number
  ): void {
    const grades = this.GeminiGrades();

    if (grades[criterion] !== value) {
      this.GeminiGrades.set(Object.assign({}, grades, {
        [criterion]: value
      }));

      this.GeminiSubmitted = false;
    }
  }

  selectedItems = signal<SelectedItem[]>([]);
  markedResult: { id: string; position: number } | null = null;
  submitted = false;

  GPTonLeft = signal(Math.random() < 0.5);

  constructor(private searchService: SearchService,
              private evaluationService: EvaluationService,) {}

  ngOnInit() {

    if (this.viewSignal == null) {
      //this.viewSignal = signal('search');
      this.viewSignal = signal('app-demo');
      this.searchService.searchQuery$
        .pipe(takeUntil(this.destroy$))
        .subscribe(query => {
          this.searchQuery = query;
          this.GPTsubmitted = false;
          this.GeminiSubmitted = false;
          this.resetGrades();
        });

      this.searchService.searchResults$
        .pipe(takeUntil(this.destroy$))
        .subscribe(results => {
          this.results = results;
          console.log('Received search results:', results);
          this.GPTonLeft.set(Math.random() < 0.5);
          this.searchItems.set(results);
        });

      this.searchService.GPTsummary$
        .pipe(takeUntil(this.destroy$))
        .subscribe(summary => {
          this.GPTsummary.set(
            this.sanitizer.sanitize(SecurityContext.HTML, summary) ?? ''
          );
        });

      this.searchService.GeminiSummary$
        .pipe(takeUntil(this.destroy$))
        .subscribe(summary => {
          this.GeminiSummary.set(
            this.sanitizer.sanitize(SecurityContext.HTML, summary) ?? ''
          );
        });
    }
    else{
      this.evaluationService.searchQuery$
        .pipe(takeUntil(this.destroy$))
        .subscribe(query => {
          this.searchQuery = query;
          this.submitted = false;

          console.log('Evaluation query:', query);
        });
      this.evaluationService.selectedIds$
        .pipe(takeUntil(this.destroy$))
        .subscribe(selectedIds => {

          const selected = this.searchItems()
            .map((item, index) => ({
              id: item.id,
              position: index + 1
            }))
            .filter(item => selectedIds.has(item.id));

          this.selectedItems.set(selected);
        });
      this.evaluationService.markedId$
        .pipe(takeUntil(this.destroy$))
        .subscribe(markedId => {
          if (!markedId) {
            this.markedResult = null;
            return;
          }

          const index = this.searchItems().findIndex(
            item => item.id === markedId
          );

          if (index >= 0) {
            this.markedResult = {
              id: markedId,
              position: index + 1
            };
          } else {
            this.markedResult = null;
          }
        });
    }
  }

  toggleSelection(item: result): void {

    this.submitted = false;

    const selectedIds = new Set(
      this.evaluationService.getSelectedIds()
    );

    if (selectedIds.has(item.id)) {
      selectedIds.delete(item.id);
    } else {
      selectedIds.add(item.id);
    }

    this.evaluationService.setSelectedIds(selectedIds);

    console.log('Selected items:', this.selectedItems());
  }

  isSelected(item: result): boolean {
    return this.evaluationService.getSelectedIds().has(item.id);
  }

  markResult(item: result): void {
    this.submitted = false;

    const currentMarkedId = this.evaluationService.getMarkedId();

    this.evaluationService.setMarkedId(
      currentMarkedId === item.id ? null : item.id
    );
  }

  isMarked(item: result): boolean {
    return this.markedResult?.id === item.id;
  }

  getRejectedItems(): SelectedItem[] {
    return this.searchItems()
      .map((item, index) => ({
        id: item.id,
        position: index + 1
      }))
      .filter(item =>
        !this.selectedItems().some(selected => selected.id === item.id)
      );
  }

  submitSelected(): void {

    const data = {
      query: this.searchQuery,
      component: this.resultComponent,
      accepted: this.selectedItems(),
      marked: this.markedResult,
      rejected: this.getRejectedItems()
    };

    this.evaluationService.submitSelected(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submitted = true;
        },
        error: error => {
          console.error('Submission failed:', error);
          this.submitted = false;
        }
      });
  }

  sendComapareEval(model: 'GPT' | 'Gemini'): void {
    const evaluation = {
      query: this.searchQuery,
      model,
      summary: model === 'GPT'
        ? this.GPTsummary()
        : this.GeminiSummary(),
      grades: model === 'GPT'
        ? this.GPTgrades()
        : this.GeminiGrades(),
      resultIds: this.searchItems().map(
        (item, index) => ({
          id: item.id,
          position: index + 1
        })
      )
    };

    this.searchService.submitCompareEvaluation(evaluation)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (model === 'GPT') {
            this.GPTsubmitted = true;
          } else {
            this.GeminiSubmitted = true;
          }
        },
        error: error => {
          console.error('Evaluation submission failed:', error);
        }
      });
  }

  resetGrades(): void {
    this.GPTgrades.set({
      fluency: 0,
      groundness: 0,
      faithfulness: 0
    });

    this.GeminiGrades.set({
      fluency: 0,
      groundness: 0,
      faithfulness: 0
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
