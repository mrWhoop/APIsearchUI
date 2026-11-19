import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {SearchComponent} from '../search/search.component';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, RouterLinkActive, SearchComponent],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {

}
