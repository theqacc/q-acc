export interface INewUer {
  fullName: string;
  email?: string;
  username?:string;
  avatar?: string;
  newUser: boolean;
}

export interface IUser {
  id: string;
  fullName: string;
  email: string;
  username: string;
  avatar: string;
  isSignedIn: boolean;
  privadoVerified: boolean;
  acceptedToS: boolean;
  walletAddress?: string;
  url?: string;
  location?: string;
  likedProjectsCount?: number;
  donationsCount?: number;
  totalDonated?: number;
  projectsCount?: number;
  passportScore?: number;
  passportStamps?: number;
  analysisScore?: number;
  hasEnoughGitcoinPassportScore?: boolean;
  hasEnoughGitcoinAnalysisScore?: boolean;
  qaccPoints: number;
  qaccPointsMultiplier: number;
  projectsFundedCount: number;
  rank: number;
  skipVerification?: boolean;
}

export interface IGivethUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  avatar: string;
}

export interface IProjectUserDonationCapKyc {
  qAccCap: number;
  gitcoinPassport: {
    unusedCap: number;
  };
  zkId: {
    unusedCap: number;
  };
}

export interface IUserFullInfo extends IGivethUser {
  walletAddress: string;
  url: string;
  location: string;
  likedProjectsCount: number;
  donationsCount: number;
  projectsCount: number;
  passportScore: number;
  passportStamps: number;
  analysisScore: number;
}
