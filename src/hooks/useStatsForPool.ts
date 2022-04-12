import { useCallback, useState, useEffect } from 'react';
import usePeakFinance from './usePeakFinance';
import { Bank } from '../peak-finance';
import { PoolStats } from '../peak-finance/types';
import config from '../config';

const useStatsForPool = (bank: Bank) => {
  const peakFinance = usePeakFinance();

  const [poolAPRs, setPoolAPRs] = useState<PoolStats>();

  const fetchAPRsForPool = useCallback(async () => {
    setPoolAPRs(await peakFinance.getPoolAPRs(bank));
  }, [peakFinance, bank]);

  useEffect(() => {
    fetchAPRsForPool().catch((err) => console.error(`Failed to fetch PBOND price: ${err.stack}`));
    const refreshInterval = setInterval(fetchAPRsForPool, config.refreshInterval);
    return () => clearInterval(refreshInterval);
  }, [setPoolAPRs, peakFinance, fetchAPRsForPool]);

  return poolAPRs;
};

export default useStatsForPool;
