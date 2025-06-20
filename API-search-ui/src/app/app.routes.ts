import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/result/result.component').then((m) => m.ResultComponent),
  },
  {
  path: 'evaluation',
  pathMatch: 'full',
  loadComponent: () =>{
    return import('./components/result-wrapper/result-wrapper.component').then((m) => m.ResultWrapperComponent);
  }
}];
