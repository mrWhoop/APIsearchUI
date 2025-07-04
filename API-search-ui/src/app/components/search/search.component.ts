import {Component, OnInit} from '@angular/core';
import {filter, Subject, takeUntil} from 'rxjs';
import {result} from '../../model/result.type';
import {SearchService} from '../../services/search.service';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {NavigationEnd, Router} from '@angular/router';
import {EvaluationService} from '../../services/evaluation.service';

@Component({
  selector: 'app-search',
  imports: [
    FormsModule
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {
  private destroy$ = new Subject<void>();
  private currentService: any;

  searchQuery: string = '';
  loading: boolean = false;
  error: string | null = null;
  results: result[] = [];

  constructor(
    private router: Router,
    private searchService: SearchService,
    private evaluationService: EvaluationService
  ) {}

  ngOnInit() {
    this.setServiceBasedOnURL();

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.setServiceBasedOnURL();
      });
  }

  private setServiceBasedOnURL() {
    const currentUrl = this.router.url;

    if (currentUrl.includes('/evaluation')) {
      this.currentService = this.evaluationService;
      console.log('I am in evaluation', currentUrl);
    }
    else{
      this.currentService = this.searchService;
      console.log('I am in search', currentUrl);
    }
  }

  onSearchInput(event: any): void {
    const query = event.target.value;
    this.searchQuery = query;

    if (query.trim()) {
      this.currentService.search(this.searchQuery);
    } else {
      this.currentService.clearResults();
    }
  }

  performSearch(): void {
    if (this.searchQuery.trim()) {
      this.currentService.search(this.searchQuery);
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentService.clearResults();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
