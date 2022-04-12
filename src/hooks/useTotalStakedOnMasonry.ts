import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import usePeakFinance from './usePeakFinance';
import useRefresh from './useRefresh';

const useTotalStakedOnMasonry = () => {
  const [totalStaked, setTotalStaked] = useState(BigNumber.from(0));
  const peakFinance = usePeakFinance();
  const { slowRefresh } = useRefresh();
  const isUnlocked = peakFinance?.isUnlocked;

  useEffect(() => {
    async function fetchTotalStaked() {
      try {
        setTotalStaked(await peakFinance.getTotalStakedInMasonry());
      } catch(err) {
        console.error(err);
      }
    }
    if (isUnlocked) {
     fetchTotalStaked();
    }
  }, [isUnlocked, slowRefresh, peakFinance]);

  return totalStaked;
};

export default useTotalStakedOnMasonry;
