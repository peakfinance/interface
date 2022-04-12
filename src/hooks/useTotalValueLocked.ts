import { useEffect, useState } from 'react';
import usePeakFinance from './usePeakFinance';
import useRefresh from './useRefresh';

const useTotalValueLocked = () => {
  const [totalValueLocked, setTotalValueLocked] = useState<Number>(0);
  const { slowRefresh } = useRefresh();
  const peakFinance = usePeakFinance();

  useEffect(() => {
    async function fetchTVL() {
      try {
        setTotalValueLocked(await peakFinance.getTotalValueLocked());
      }
      catch(err){
        console.error(err);
      }
    }
    fetchTVL();
  }, [setTotalValueLocked, peakFinance, slowRefresh]);

  return totalValueLocked;
};

export default useTotalValueLocked;
