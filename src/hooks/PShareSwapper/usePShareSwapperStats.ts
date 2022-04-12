import { useEffect, useState } from 'react';
import usePeakFinance from '../usePeakFinance';
import { PShareSwapperStat } from '../../peak-finance/types';
import useRefresh from '../useRefresh';

const usePShareSwapperStats = (account: string) => {
  const [stat, setStat] = useState<PShareSwapperStat>();
  const { fastRefresh/*, slowRefresh*/ } = useRefresh();
  const peakFinance = usePeakFinance();

  useEffect(() => {
    async function fetchPShareSwapperStat() {
      try{
        if(peakFinance.myAccount) {
          setStat(await peakFinance.getPShareSwapperStat(account));
        }
      }
      catch(err){
        console.error(err);
      }
    }
    fetchPShareSwapperStat();
  }, [setStat, peakFinance, fastRefresh, account]);

  return stat;
};

export default usePShareSwapperStats;