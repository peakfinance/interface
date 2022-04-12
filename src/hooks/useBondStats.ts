import { useEffect, useState } from 'react';
import usePeakFinance from './usePeakFinance';
import { TokenStat } from '../peak-finance/types';
import useRefresh from './useRefresh';

const useBondStats = () => {
  const [stat, setStat] = useState<TokenStat>();
  const { slowRefresh } = useRefresh();
  const peakFinance = usePeakFinance();

  useEffect(() => {
    async function fetchBondPrice() {
      try {
        setStat(await peakFinance.gepBondStat());
      }
      catch(err){
        console.error(err);
      }
    }
    fetchBondPrice();
  }, [setStat, peakFinance, slowRefresh]);

  return stat;
};

export default useBondStats;
