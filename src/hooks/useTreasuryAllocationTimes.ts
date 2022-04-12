import { useEffect, useState } from 'react';
import usePeakFinance from './usePeakFinance';
import { AllocationTime } from '../peak-finance/types';
import useRefresh from './useRefresh';


const useTreasuryAllocationTimes = () => {
  const { slowRefresh } = useRefresh();
  const [time, setTime] = useState<AllocationTime>({
    from: new Date(),
    to: new Date(),
  });
  const peakFinance = usePeakFinance();
  useEffect(() => {
    if (peakFinance) {
      peakFinance.getTreasuryNextAllocationTime().then(setTime);
    }
  }, [peakFinance, slowRefresh]);
  return time;
};

export default useTreasuryAllocationTimes;
