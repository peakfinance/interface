import { useCallback, useEffect, useState } from 'react';
import usePeakFinance from './usePeakFinance';
import useStakedBalanceOnMasonry from './useStakedBalanceOnMasonry';

const useMasonryVersion = () => {
  const [masonryVersion, setMasonryVersion] = useState('latest');
  const peakFinance = usePeakFinance();
  const stakedBalance = useStakedBalanceOnMasonry();

  const updateState = useCallback(async () => {
    setMasonryVersion(await peakFinance.fetchMasonryVersionOfUser());
  }, [peakFinance?.isUnlocked, stakedBalance]);

  useEffect(() => {
    if (peakFinance?.isUnlocked) {
      updateState().catch((err) => console.error(err.stack));
    }
  }, [peakFinance?.isUnlocked, stakedBalance]);

  return masonryVersion;
};

export default useMasonryVersion;
