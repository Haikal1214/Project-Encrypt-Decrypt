export interface PersonalInfo {
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