import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ResultWrapperComponent} from './components/result-wrapper/result-wrapper.component';
import {SearchComponent} from './components/search/search.component';
import {NavBarComponent} from './components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBarComponent, ResultWrapperComponent, SearchComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'API-search-ui';
}
