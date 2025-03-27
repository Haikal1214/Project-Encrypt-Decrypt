import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as QRCode from 'qrcode';
import { Profile, ProfileService } from '../../services/profile.service';
import { ProfileDialogComponent } from '../profile-dialog/profile-dialog.component';
import { QRDecryptComponent } from '../qr-decrypt/qr-decrypt.component';

@Component({
  selector: 'app-home',
  template: `
    <div class="container">
      <h1>Welcome to NIISe</h1>
      <p>Your secure QR code encryption and decryption system</p>
      
      <div class="actions">
        <button mat-raised-button color="primary" (click)="openAddProfileDialog()">
          Add New Profile
        </button>
        <button mat-raised-button color="accent" (click)="openQRDecryptDialog()">
          Decrypt QR Code
        </button>
      </div>

      <div class="profiles-grid">
        <mat-card *ngFor="let profile of profiles" class="profile-card">
          <mat-card-header>
            <mat-card-title>{{ profile.name }}</mat-card-title>
            <button mat-icon-button (click)="generateQRCode(profile)">
              <mat-icon>qr_code</mat-icon>
            </button>
          </mat-card-header>
          <mat-card-content>
            <p><strong>Email:</strong> {{ profile.email }}</p>
            <p><strong>Age:</strong> {{ profile.age }}</p>
            <p><strong>Address:</strong> {{ profile.address }}</p>
            <div class="qr-code" *ngIf="profile.qrCodePath">
              <img [src]="profile.qrCodePath" alt="QR Code">
              <button mat-button color="primary" (click)="downloadQRCode(profile)">
                Download QR
              </button>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" (click)="editProfile(profile)">Edit</button>
            <button mat-button color="warn" (click)="deleteProfile(profile.id!)">Delete</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .actions {
      margin: 20px 0;
    }
    .profiles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .profile-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .qr-code {
      margin: 15px 0;
      text-align: center;
    }
    .qr-code img {
      max-width: 200px;
      margin-bottom: 10px;
    }
    mat-card-actions {
      margin-top: auto;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
  `]
})
export class HomeComponent implements OnInit {
  profiles: Profile[] = [];

  constructor(
    private profileService: ProfileService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProfiles();
  }

  loadProfiles(): void {
    console.log('Loading profiles...');
    this.profileService.getProfiles().subscribe({
      next: (profiles) => {
        console.log('Profiles loaded:', profiles);
        this.profiles = profiles;
      },
      error: (error) => {
        console.error('Error loading profiles:', error);
        this.snackBar.open('Error loading profiles', 'Close', { duration: 3000 });
      }
    });
  }

  openAddProfileDialog(): void {
    const dialogRef = this.dialog.open(ProfileDialogComponent, {
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Creating profile:', result);
        this.profileService.createProfile(result).subscribe({
          next: (profile) => {
            console.log('Profile created:', profile);
            this.snackBar.open('Profile created successfully', 'Close', { duration: 3000 });
            this.loadProfiles();
          },
          error: (error) => {
            console.error('Error creating profile:', error);
            this.snackBar.open('Error creating profile', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  editProfile(profile: Profile): void {
    const dialogRef = this.dialog.open(ProfileDialogComponent, {
      data: profile
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Updating profile:', result);
        this.profileService.updateProfile(profile.id!, result).subscribe({
          next: (updatedProfile) => {
            console.log('Profile updated:', updatedProfile);
            this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
            this.loadProfiles();
          },
          error: (error) => {
            console.error('Error updating profile:', error);
            this.snackBar.open('Error updating profile', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteProfile(id: number): void {
    if (confirm('Are you sure you want to delete this profile?')) {
      console.log('Deleting profile:', id);
      this.profileService.deleteProfile(id).subscribe({
        next: () => {
          console.log('Profile deleted successfully');
          this.snackBar.open('Profile deleted successfully', 'Close', { duration: 3000 });
          this.loadProfiles();
        },
        error: (error) => {
          console.error('Error deleting profile:', error);
          this.snackBar.open('Error deleting profile', 'Close', { duration: 3000 });
        }
      });
    }
  }

  generateQRCode(profile: Profile): void {
    try {
      // Create a data object with the profile information
      const qrData = {
        name: profile.name,
        email: profile.email,
        age: profile.age,
        address: profile.address
      };

      // Convert the data to a string
      const qrString = JSON.stringify(qrData);

      // Generate QR code as data URL
      QRCode.toDataURL(qrString, {
        width: 350,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }, (err: Error | null | undefined, url: string) => {
        if (err) {
          console.error('Error generating QR code:', err);
          this.snackBar.open('Error generating QR code', 'Close', { duration: 3000 });
          return;
        }
        
        // Update the profile with the QR code URL
        profile.qrCodePath = url;
        this.snackBar.open('QR code generated successfully', 'Close', { duration: 3000 });
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      this.snackBar.open('Error generating QR code', 'Close', { duration: 3000 });
    }
  }

  downloadQRCode(profile: Profile): void {
    if (profile.qrCodePath) {
      const link = document.createElement('a');
      link.href = profile.qrCodePath;
      link.download = `qr-code-${profile.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  openQRDecryptDialog(): void {
    this.dialog.open(QRDecryptComponent, {
      width: '500px'
    });
  }
} 