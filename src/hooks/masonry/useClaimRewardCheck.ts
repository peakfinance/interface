import { useEffect, useState } from 'react';
import useRefresh from '../useRefresh';
import usePeakFinance from './../usePeakFinance';

const useClaimRewardCheck = () => {
  const  { slowRefresh } = useRefresh();
  const [canClaimReward, setCanClaimReward] = useState(false);
  const peakFinance = usePeakFinance();
  const isUnlocked = peakFinance?.isUnlocked;

  useEffect(() => {
    async function canUserClaimReward() {
      try {
        setCanClaimReward(await peakFinance.canUserClaimRewardFromMasonry());
      } catch(err){
        console.error(err);
      };
    }
    if (isUnlocked) {
      canUserClaimReward();
    }
  }, [isUnlocked, slowRefresh, peakFinance]);

  return canClaimReward;
};

export default useClaimRewardCheck;
