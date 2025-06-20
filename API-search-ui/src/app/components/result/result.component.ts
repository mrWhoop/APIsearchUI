import {Component, inject, Input, OnInit, signal} from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import {SearchService} from '../../services/search.service';
import {result} from '../../model/result.type';
import {catchError} from 'rxjs';

@Component({
  selector: 'app-result',
  imports: [],
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})

// on init samo za testiranje

export class ResultComponent implements OnInit {
  searchService = inject(SearchService)
  searchItems = signal<Array<result>>([]);
  @Input() viewSignal!: Signal<string>;

  ngOnInit() {
    this.searchService.searchAPI('none')
      .pipe(
        catchError((err) => {
          console.log(err);
          throw err;
        })
    ).subscribe((result) => {
      this.searchItems.set(result);
    })
    if (this.viewSignal == null) {
      this.viewSignal = signal('search');
    }
  }
}
