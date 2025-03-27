import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PersonalInfo } from '../models/personal-info.model';

@Injectable({
  providedIn: 'root'
})
export class PersonalInfoService {
  private apiUrl = 'http://localhost:8081/api/personal-info';

  constructor(private http: HttpClient) { }

  getAllProfiles(): Observable<PersonalInfo[]> {
    return this.http.get<PersonalInfo[]>(this.apiUrl);
  }

  createProfile(profile: PersonalInfo): Observable<PersonalInfo> {
    return this.http.post<PersonalInfo>(this.apiUrl, profile);
  }

  generateQRCode(id: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/${id}/generate-qr`, null);
  }

  decryptQRCode(qrData: string): Observable<PersonalInfo> {
    return this.http.post<PersonalInfo>(`${this.apiUrl}/decrypt-qr`, qrData);
  }
} 