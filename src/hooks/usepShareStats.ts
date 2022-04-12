import { useEffect, useState } from 'react';
import usePeakFinance from './usePeakFinance';
import { TokenStat } from '../peak-finance/types';
import useRefresh from './useRefresh';

const useShareStats = () => {
  const [stat, setStat] = useState<TokenStat>();
  const { slowRefresh } = useRefresh();
  const peakFinance = usePeakFinance();

  useEffect(() => {
    async function fetchSharePrice() {
      try {
        setStat(await peakFinance.gepShareStat());
      } catch(err){
        console.error(err)
      }
    }
    fetchSharePrice();
  }, [setStat, peakFinance, slowRefresh]);

  return stat;
};

export default useShareStats;
