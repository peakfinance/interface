import { useEffect, useState } from 'react';
import usePeakFinance from './usePeakFinance';
import useRefresh from './useRefresh';

const useFetchMasonryAPR = () => {
  const [apr, setApr] = useState<number>(0);
  const peakFinance = usePeakFinance();
  const { slowRefresh } = useRefresh(); 

  useEffect(() => {
    async function fetchMasonryAPR() {
      try {
        setApr(await peakFinance.getMasonryAPR());
      } catch(err){
        console.error(err);
      }
    }
   fetchMasonryAPR();
  }, [setApr, peakFinance, slowRefresh]);

  return apr;
};

export default useFetchMasonryAPR;
