import {inject, Injectable} from '@angular/core';
import {result} from '../model/result.type';
import {HttpClient, HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class SearchService {
  http = inject(HttpClient)
  private baseUrl = 'http://localhost:8080';

  searchAPI(query: string){

    let params = new HttpParams().set("q", query);

    return this.http.get<Array<result>>(`${this.baseUrl}/search`, { params })

  }

  constructor() { }
}
