export type UploadField =
  | "licenceFront"
  | "licenceBack"
  | "idPassport"
  | "rightToWorkFile"
  | "niDocument"
  | "addressProof";

export interface ApplicationData {
  // Account
  firstName: string;
  lastName: string;
  email: string;
  password: string; // placeholder only, won’t store in prod
  phone: string;

  // Auth flow
  code: string;

  // Driver's licence
  licenceNumber: string;
  licenceExpiry: string; // ISO date

  // Identification
  idExpiry: string;      // ISO date
  passportCountry: string;

  // Right to work
  rightToWork: "" | "British Passport" | "Birth Certificate" | "Share Code";
  shareCode: string;

  // NI
  niNumber: string;

  // Address
  addressLine1: string;
  addressLine2?: string;
  town: string;
  county: string;
  postcode: string;

  // “Files” (we’ll store URIs/filenames later)
  licenceFront?: string | null;
  licenceBack?: string | null;
  idPassport?: string | null;
  rightToWorkFile?: string | null;
  niDocument?: string | null;
  addressProof?: string | null;
}

export const emptyApplication: ApplicationData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",

  code: "",

  licenceNumber: "",
  licenceExpiry: "",

  idExpiry: "",
  passportCountry: "",

  rightToWork: "",
  shareCode: "",

  niNumber: "",

  addressLine1: "",
  addressLine2: "",
  town: "",
  county: "",
  postcode: "",

  licenceFront: null,
  licenceBack: null,
  idPassport: null,
  rightToWorkFile: null,
  niDocument: null,
  addressProof: null,
};
