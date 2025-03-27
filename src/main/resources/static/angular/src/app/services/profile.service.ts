import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Profile {
  id?: number;
  name: string;
  email: string;
  age: number;
  password: string;
  address: string;
  encryptedData?: string;
  qrCodePath?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:8081/api/personal-info';

  constructor(private http: HttpClient) { }

  getProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(this.apiUrl);
  }

  createProfile(profile: Omit<Profile, 'id'>): Observable<Profile> {
    return this.http.post<Profile>(this.apiUrl, profile);
  }

  updateProfile(id: number, profile: Partial<Profile>): Observable<Profile> {
    return this.http.put<Profile>(`${this.apiUrl}/${id}`, profile);
  }

  deleteProfile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  generateQRCode(id: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/${id}/generate-qr`, null);
  }

  decryptQRCode(qrData: string): Observable<Profile> {
    return this.http.post<Profile>(`${this.apiUrl}/decrypt-qr`, qrData);
  }
} 