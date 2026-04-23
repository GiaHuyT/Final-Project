export class CreateDriverRentalDto {
  name: string;
  dob?: string;
  experienceYears?: number;
  pricePerKm?: number;
  avatarUrl?: string;
  licenseFrontUrl?: string;
  licenseBackUrl?: string;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  criminalRecordUrl?: string;
  status?: string;
}
