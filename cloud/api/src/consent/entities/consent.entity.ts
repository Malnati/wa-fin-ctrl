// Consent entity for database persistence

export class ConsentEntity {
  id!: string;
  userEmail!: string;
  dataProcessing!: boolean;
  termsAndPrivacy!: boolean;
  version!: string;
  timestamp!: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<ConsentEntity>) {
    Object.assign(this, partial);
  }
}
