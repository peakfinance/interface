import { useEffect, useState } from 'react';
import usePeakFinance from './usePeakFinance';
import { TokenStat } from '../peak-finance/types';
import useRefresh from './useRefresh';

const usePeakStats = () => {
  const [stat, setStat] = useState<TokenStat>();
  const { fastRefresh } = useRefresh();
  const peakFinance = usePeakFinance();

  useEffect(() => {
    async function fetchPeakPrice(){
      try {
        setStat(await peakFinance.getPeakStat());
      }
      catch(err){
        console.error(err)
      }
    }
    fetchPeakPrice();
  }, [setStat, peakFinance, fastRefresh]);

  return stat;
};

export default usePeakStats;
