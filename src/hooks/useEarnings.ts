import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import usePeakFinance from './usePeakFinance';
import { ContractName } from '../peak-finance';
import config from '../config';

const useEarnings = (poolName: ContractName, earnTokenName: String, poolId: Number) => {
  const [balance, setBalance] = useState(BigNumber.from(0));
  const peakFinance = usePeakFinance();
  const isUnlocked = peakFinance?.isUnlocked;

  const fetchBalance = useCallback(async () => {
    const balance = await peakFinance.earnedFromBank(poolName, earnTokenName, poolId, peakFinance.myAccount);
    setBalance(balance);
  }, [poolName, earnTokenName, poolId, peakFinance]);

  useEffect(() => {
    if (isUnlocked) {
      fetchBalance().catch((err) => console.error(err.stack));

      const refreshBalance = setInterval(fetchBalance, config.refreshInterval);
      return () => clearInterval(refreshBalance);
    }
  }, [isUnlocked, poolName, peakFinance, fetchBalance]);

  return balance;
};

export default useEarnings;
