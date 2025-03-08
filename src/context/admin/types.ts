
export interface AdminUser {
  id: string;
  email: string;
  is_admin: boolean;
}

export interface AdminCredentials {
  email: string;
  password: string;
}
