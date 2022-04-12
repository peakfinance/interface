import { useEffect, useState } from 'react';
import usePeakFinance from './usePeakFinance';
import { BigNumber } from 'ethers';
import useRefresh from './useRefresh';

const useCurrentEpoch = () => {
  const [currentEpoch, setCurrentEpoch] = useState<BigNumber>(BigNumber.from(0));
  const peakFinance = usePeakFinance();
  const { slowRefresh } = useRefresh(); 

  useEffect(() => {
    async function fetchCurrentEpoch () {
      try {
        setCurrentEpoch(await peakFinance.getCurrentEpoch());
      } catch(err) {
        console.error(err);
      }
    }
    fetchCurrentEpoch();
  }, [setCurrentEpoch, peakFinance, slowRefresh]);

  return currentEpoch;
};

export default useCurrentEpoch;
