// types/auth.ts
import { User as FirebaseUser } from 'firebase/auth';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface LoginFormData {
  email: string;
  password: string;
}