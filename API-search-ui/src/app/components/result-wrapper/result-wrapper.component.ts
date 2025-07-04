import {Component, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {ResultComponent} from '../result/result.component';
import {result} from '../../model/result.type';
import {EvaluationService} from '../../services/evaluation.service';
import {Subject, takeUntil} from 'rxjs';
import {SearchService} from '../../services/search.service';



@Component({
  selector: 'app-result-wrapper',
  imports: [
    ResultComponent
  ],
  templateUrl: './result-wrapper.component.html',
  styleUrl: './result-wrapper.component.css'
})
export class ResultWrapperComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  viewSignal = signal('evaluation')
  searchItemsGPTres: result[] = [];
  searchItemsMeilires: result[] = [];
  searchItemsGeminires: result[] = [];
  searchItemsGPT = signal<Array<result>>([]);
  searchItemsMeiliSearch = signal<Array<result>>([]);
  searchItemsGemini = signal<Array<result>>([]);

  constructor(private evaluationService: EvaluationService) {
  }

  ngOnInit(): void {

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

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
