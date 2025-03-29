import { Iregister } from './../models/iregister';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ilogin } from '../models/ilogin';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient : HttpClient) {}

  registerUser(user : Iregister) : Observable<any> {
    return this.httpClient.post('http://localhost:5005/api/users',user);
  }
  loginUser(user : Ilogin) : Observable<any> {
    return this.httpClient.post('/api/auth',user);
  }
}
