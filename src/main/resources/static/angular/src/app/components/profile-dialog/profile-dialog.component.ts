import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Profile } from '../../services/profile.service';

@Component({
  selector: 'app-profile-dialog',
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit Profile' : 'Add New Profile' }}</h2>
    <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="fill">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" required>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" required type="email">
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Age</mat-label>
          <input matInput formControlName="age" required type="number">
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Password</mat-label>
          <input matInput formControlName="password" required type="password">
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Address</mat-label>
          <textarea matInput formControlName="address" required></textarea>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="!profileForm.valid">
          {{ data ? 'Update' : 'Create' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    mat-dialog-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 350px;
    }
    mat-form-field {
      width: 100%;
    }
  `]
})
export class ProfileDialogComponent {
  profileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Profile | null
  ) {
    this.profileForm = this.fb.group({
      name: [data?.name || '', Validators.required],
      email: [data?.email || '', [Validators.required, Validators.email]],
      age: [data?.age || '', [Validators.required, Validators.min(0)]],
      password: [data?.password || '', Validators.required],
      address: [data?.address || '', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.dialogRef.close(this.profileForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 