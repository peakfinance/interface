import { useEffect, useState } from 'react';
import usePeakFinance from './../usePeakFinance';
import { AllocationTime } from '../../peak-finance/types';

const useUnstakeTimerMasonry = () => {
  const [time, setTime] = useState<AllocationTime>({
    from: new Date(),
    to: new Date(),
  });
  const peakFinance = usePeakFinance();

  useEffect(() => {
    if (peakFinance) {
      peakFinance.getUserUnstakeTime().then(setTime);
    }
  }, [peakFinance]);
  return time;
};

export default useUnstakeTimerMasonry;
