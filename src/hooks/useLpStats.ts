import { useEffect, useState } from 'react';
import usePeakFinance from './usePeakFinance';
import { LPStat } from '../peak-finance/types';
import useRefresh from './useRefresh';

const useLpStats = (lpTicker: string) => {
  const [stat, setStat] = useState<LPStat>();
  const { slowRefresh } = useRefresh();
  const peakFinance = usePeakFinance();

  useEffect(() => {
    async function fetchLpPrice() {
      try{
        setStat(await peakFinance.getLPStat(lpTicker));
      }
      catch(err){
        console.error(err);
      }
    }
    fetchLpPrice();
  }, [setStat, peakFinance, slowRefresh, lpTicker]);

  return stat;
};

export default useLpStats;
