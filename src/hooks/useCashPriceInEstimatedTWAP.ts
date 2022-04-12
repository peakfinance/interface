import { useEffect, useState } from 'react';
import usePeakFinance from './usePeakFinance';
import { TokenStat } from '../peak-finance/types';
import useRefresh from './useRefresh';

const useCashPriceInEstimatedTWAP = () => {
  const [stat, setStat] = useState<TokenStat>();
  const peakFinance = usePeakFinance();
  const { slowRefresh } = useRefresh(); 

  useEffect(() => {
    async function fetchCashPrice() {
      try {
        setStat(await peakFinance.getPeakStatInEstimatedTWAP());
      }catch(err) {
        console.error(err);
      }
    }
    fetchCashPrice();
  }, [setStat, peakFinance, slowRefresh]);

  return stat;
};

export default useCashPriceInEstimatedTWAP;
