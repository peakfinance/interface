import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import usePeakFinance from './usePeakFinance';
import useRefresh from './useRefresh';

const useEarningsOnMasonry = () => {
  const { slowRefresh } = useRefresh();
  const [balance, setBalance] = useState(BigNumber.from(0));
  const peakFinance = usePeakFinance();
  const isUnlocked = peakFinance?.isUnlocked;

  useEffect(() => {
    async function fetchBalance() {
      try {
        setBalance(await peakFinance.getEarningsOnMasonry());
      } catch (e) {
        console.error(e);
      }
    }
    if (isUnlocked) {
      fetchBalance();
    }
  }, [isUnlocked, peakFinance, slowRefresh]);

  return balance;
};

export default useEarningsOnMasonry;
