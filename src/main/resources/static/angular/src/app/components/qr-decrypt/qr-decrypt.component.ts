import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import jsQR from "jsqr";

@Component({
  selector: 'app-qr-decrypt',
  template: `
    <h2 mat-dialog-title>Decrypt QR Code</h2>
    <mat-dialog-content>
      <div class="upload-container">
        <input
          type="file"
          #fileInput
          accept="image/*"
          (change)="onFileSelected($event)"
          style="display: none"
        >
        <button mat-raised-button color="primary" (click)="fileInput.click()">
          Upload QR Code Image
        </button>
        <div *ngIf="previewImage" class="preview-container">
          <img [src]="previewImage" alt="QR Code Preview" class="preview-image">
        </div>
      </div>
      <div *ngIf="decryptedData" class="result-container">
        <h3>Decrypted Information:</h3>
        <mat-card>
          <mat-card-content>
            <p><strong>Name:</strong> {{ decryptedData.name }}</p>
            <p><strong>Email:</strong> {{ decryptedData.email }}</p>
            <p><strong>Age:</strong> {{ decryptedData.age }}</p>
            <p><strong>Address:</strong> {{ decryptedData.address }}</p>
          </mat-card-content>
        </mat-card>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .upload-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 20px;
    }
    .preview-container {
      margin-top: 20px;
    }
    .preview-image {
      max-width: 300px;
      max-height: 300px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .result-container {
      margin-top: 20px;
      width: 100%;
    }
    mat-card {
      margin-top: 10px;
    }
  `]
})
export class QRDecryptComponent {
  previewImage: string | null = null;
  decryptedData: any = null;

  constructor(
    private dialogRef: MatDialogRef<QRDecryptComponent>,
    private snackBar: MatSnackBar
  ) {}

  onFileSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      this.qrCodeUploadedHandler(files);
    }
  }

  qrCodeUploadedHandler(files: FileList): void {
    const file = files[0];
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    fileReader.onload = (event: ProgressEvent) => {
      this.previewImage = (event.target as FileReader).result as string;
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const width = img.width;
        const height = img.height;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          this.snackBar.open('Error processing image', 'Close', { duration: 3000 });
          return;
        }

        ctx.drawImage(img, 0, 0);
        const qrCodeImageFormat = ctx.getImageData(0, 0, width, height);
        const qrDecoded = jsQR(qrCodeImageFormat.data, qrCodeImageFormat.width, qrCodeImageFormat.height);

        if (qrDecoded) {
          try {
            this.decryptedData = JSON.parse(qrDecoded.data);
            this.snackBar.open('QR code decrypted successfully', 'Close', { duration: 3000 });
          } catch (error) {
            console.error('Error parsing QR code data:', error);
            this.snackBar.open('Invalid QR code format', 'Close', { duration: 3000 });
          }
        } else {
          this.snackBar.open('No QR code found in image', 'Close', { duration: 3000 });
        }

        canvas.remove();
      };

      img.onerror = () => {
        this.snackBar.open('Error loading image', 'Close', { duration: 3000 });
      };

      img.src = this.previewImage;
    };
  }

  onClose(): void {
    this.dialogRef.close();
  }
} 