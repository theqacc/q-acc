import { useState, useEffect, useCallback } from 'react';
import { useFetchUser } from './useFetchUser';
import { useFetchUserGitcoinPassportScore } from './useFetchUserGitcoinScore';
import config from '@/config/configuration';
import { Address } from 'viem';

export enum GitcoinVerificationStatus {
  NOT_CHECKED,
  ANALYSIS_PASS,
  SCORER_PASS,
  LOW_SCORE,
}

export const useGitcoinScore = (userAddress: Address) => {
  const [status, setStatus] = useState(GitcoinVerificationStatus.NOT_CHECKED);
  const [userGitcoinScore, setUserGitcoinScore] = useState(0);
  const { data: user, isLoading: isUserLoading, isSuccess } = useFetchUser(!!userAddress, userAddress as Address);
  const { refetch: refetchScore, isFetching: isScoreFetching } =
    useFetchUserGitcoinPassportScore();

  useEffect(() => {
    if (!isSuccess) return;
    const _analysisScore = user?.analysisScore || 0;
    const _passportScore = user?.passportScore || 0;
    setUserGitcoinScore(_passportScore);
    if (_analysisScore >= config.GP_ANALYSIS_SCORE_THRESHOLD) {
      setStatus(GitcoinVerificationStatus.ANALYSIS_PASS);
      return;
    } else if (_passportScore >= config.GP_SCORER_SCORE_THRESHOLD) {
      setStatus(GitcoinVerificationStatus.SCORER_PASS);
      return;
    } else {
      setStatus(GitcoinVerificationStatus.NOT_CHECKED);
      return;
    }
  }, [isSuccess, user?.analysisScore, user?.passportScore]);

  const onCheckScore = useCallback(async () => {
    const res = await refetchScore();
    const _analysisScore = res.data?.analysisScore || 0;
    const _passportScore = res.data?.passportScore || 0;
    setUserGitcoinScore(_passportScore);
    if (_analysisScore >= config.GP_ANALYSIS_SCORE_THRESHOLD) {
      setStatus(GitcoinVerificationStatus.ANALYSIS_PASS);
      return;
    } else if (_passportScore >= config.GP_SCORER_SCORE_THRESHOLD) {
      setStatus(GitcoinVerificationStatus.SCORER_PASS);
      return;
    } else {
      setStatus(GitcoinVerificationStatus.LOW_SCORE);
    }
  }, []);

  return {
    status,
    userGitcoinScore,
    onCheckScore,
    isUserLoading,
    isScoreFetching,
  };
};
