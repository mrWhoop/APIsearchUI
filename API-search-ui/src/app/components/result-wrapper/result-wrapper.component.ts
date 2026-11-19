import {Component, OnDestroy, OnInit, signal, WritableSignal,   ViewChildren, QueryList,} from '@angular/core';
import {ResultComponent} from '../result/result.component';
import {result} from '../../model/result.type';
import {EvaluationService} from '../../services/evaluation.service';
import {Subject, takeUntil} from 'rxjs';
import {SearchService} from '../../services/search.service';

interface ResultComponentConfig {
  name: string;
  items: WritableSignal<result[]>;
}

@Component({
  selector: 'app-result-wrapper',
  imports: [
    ResultComponent
  ],
  templateUrl: './result-wrapper.component.html',
  styleUrl: './result-wrapper.component.css'
})
export class ResultWrapperComponent implements OnInit, OnDestroy {

  @ViewChildren(ResultComponent)
  resultComponentInstances!: QueryList<ResultComponent>;

  private destroy$ = new Subject<void>();
  viewSignal = signal('evaluation')
  searchItemsGPTres: result[] = [];
  searchItemsMeilires: result[] = [];
  searchItemsGeminires: result[] = [];
  searchItemsGPTMetares: result[] = [];
  searchItemsMeiliEMMres: result[] = [];
  searchItemsGeminiMetares: result[] = [];
  searchItemsGPTDescres: result[] = [];
  searchItemsGeminiDescres: result[] = [];
  searchItemsGPTPromptres: result[] = [];
  searchItemsGeminiPromptres: result[] = [];

  searchItemsGPT = signal<Array<result>>([]);
  searchItemsMeiliSearch = signal<Array<result>>([]);
  searchItemsGemini = signal<Array<result>>([]);
  searchItemsGPTMeta = signal<Array<result>>([]);
  searchItemsMeiliSearchEMM = signal<Array<result>>([]);
  searchItemsGeminiMeta = signal<Array<result>>([]);
  searchItemsGPTDesc = signal<Array<result>>([]);
  searchItemsGeminiDesc = signal<Array<result>>([]);
  searchItemsGPTPrompt = signal<Array<result>>([]);
  searchItemsGeminiPrompt = signal<Array<result>>([]);

  resultComponents: ResultComponentConfig[] = [
    {
      name: 'OpenAISimple',
      items: this.searchItemsGPT
    },
    {
      name: 'Meilisearch',
      items: this.searchItemsMeiliSearch
    },
    {
      name: 'GeminiSimple',
      items: this.searchItemsGemini
    },
    {
      name: 'OpenAIStructured',
      items: this.searchItemsGPTMeta
    },
    {
      name: 'MeilisearchEmbed',
      items: this.searchItemsMeiliSearchEMM
    },
    {
      name: 'GeminiStructured',
      items: this.searchItemsGeminiMeta
    },
    {
      name: 'OpenAIDescriptive',
      items: this.searchItemsGPTDesc
    },
    {
      name: 'GeminiDescriptive',
      items: this.searchItemsGeminiDesc
    },
    {
      name: 'OpenAIPrompt',
      items: this.searchItemsGPTPrompt
    },
    {
      name: 'GeminiPrompt',
      items: this.searchItemsGeminiPrompt
    }
  ];

  constructor(private evaluationService: EvaluationService) {
  }

  shuffleComponents(): void {
    for (let i = this.resultComponents.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [this.resultComponents[i], this.resultComponents[j]] =
        [this.resultComponents[j], this.resultComponents[i]];
    }
  }

  submitAllEvaluations(): void {
    this.resultComponentInstances.forEach(component => {
      component.submitSelected();
    });
  }

  ngOnInit(): void {

    this.evaluationService.searchQuery$
      .pipe(takeUntil(this.destroy$))
      .subscribe(query => {
        if (query.trim()) {
          this.shuffleComponents();
        }
      });

    this.evaluationService.searchResultsGPT$
      .pipe(takeUntil(this.destroy$))
      .subscribe((searchItemsGPTres: result[]) => {
        this.searchItemsGPTres = searchItemsGPTres;
        console.log('Received search results:', searchItemsGPTres);
        this.searchItemsGPT.set(searchItemsGPTres);
      });

    this.evaluationService.searchResultsMeili$
      .pipe(takeUntil(this.destroy$))
      .subscribe((searchItemsMeilires: result[]) => {
        this.searchItemsMeilires = searchItemsMeilires;
        console.log('Received search results:', searchItemsMeilires);
        this.searchItemsMeiliSearch.set(searchItemsMeilires);
      });

    this.evaluationService.searchResultsGemini$
      .pipe(takeUntil(this.destroy$))
      .subscribe((searchItemsGeminires: result[]) => {
        this.searchItemsGeminires = searchItemsGeminires;
        console.log('Received search results:', searchItemsGeminires);
        this.searchItemsGemini.set(searchItemsGeminires);
      });

    this.evaluationService.searchResultsGPTMeta$
      .pipe(takeUntil(this.destroy$))
      .subscribe((searchItemsGPTres: result[]) => {
        this.searchItemsGPTMetares = searchItemsGPTres;
        console.log('Received search results:', searchItemsGPTres);
        this.searchItemsGPTMeta.set(searchItemsGPTres);
      });

    this.evaluationService.searchResultsMeiliEmm$
      .pipe(takeUntil(this.destroy$))
      .subscribe((searchItemsMeilires: result[]) => {
        this.searchItemsMeiliEMMres = searchItemsMeilires;
        console.log('Received search results:', searchItemsMeilires);
        this.searchItemsMeiliSearchEMM.set(searchItemsMeilires);
      });

    this.evaluationService.searchResultsGeminiMeta$
      .pipe(takeUntil(this.destroy$))
      .subscribe((searchItemsGeminires: result[]) => {
        this.searchItemsGeminiMetares = searchItemsGeminires;
        console.log('Received search results:', searchItemsGeminires);
        this.searchItemsGeminiMeta.set(searchItemsGeminires);
      });

    this.evaluationService.searchResultsGPTDesc$
      .pipe(takeUntil(this.destroy$))
      .subscribe((searchItemsGPTres: result[]) => {
        this.searchItemsGPTDescres = searchItemsGPTres;
        console.log('Received search results:', searchItemsGPTres);
        this.searchItemsGPTDesc.set(searchItemsGPTres);
      });

    this.evaluationService.searchResultsGeminiDesc$
      .pipe(takeUntil(this.destroy$))
      .subscribe((searchItemsGeminires: result[]) => {
        this.searchItemsGeminiDescres = searchItemsGeminires;
        console.log('Received search results:', searchItemsGeminires);
        this.searchItemsGeminiDesc.set(searchItemsGeminires);
      });

    this.evaluationService.searchResultsGPTPrompt$
      .pipe(takeUntil(this.destroy$))
      .subscribe((searchItemsGPTres: result[]) => {
        this.searchItemsGPTPromptres = searchItemsGPTres;
        console.log('Received search results:', searchItemsGPTres);
        this.searchItemsGPTPrompt.set(searchItemsGPTres);
      });

    this.evaluationService.searchResultsGeminiPrompt$
      .pipe(takeUntil(this.destroy$))
      .subscribe((searchItemsGeminires: result[]) => {
        this.searchItemsGeminiPromptres = searchItemsGeminires;
        console.log('Received search results:', searchItemsGeminires);
        this.searchItemsGeminiPrompt.set(searchItemsGeminires);
      });

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
