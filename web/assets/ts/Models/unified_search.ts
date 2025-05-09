export interface UnifiedSearchResults {
  Breaches: Breach[];
  Pastes: Paste[];
}

export interface Breach {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  AddedDate: string;
  ModifiedDate: string;
  PwnCount: number;
  Description: string;
  LogoPath: string;
  DataClasses: string[];
  IsVerified: boolean;
  IsFabricated: boolean;
  IsSensitive: boolean;
  IsRetired: boolean;
  IsSpamList: boolean;
  IsMalware: boolean;
  IsSubscriptionFree: boolean;
  IsStealerLog: boolean;
}
export interface Paste {
  Id: string;
  Source: string;
  Title: string;
  Date: string | null;
  EmailCount: number;
}
