import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import usePeakFinance from './usePeakFinance';
import useRefresh from './useRefresh';

const useStakedBalanceOnMasonry = () => {
  const { slowRefresh } = useRefresh();
  const [balance, setBalance] = useState(BigNumber.from(0));
  const peakFinance = usePeakFinance();
  const isUnlocked = peakFinance?.isUnlocked;
  useEffect(() => {
    async function fetchBalance() {
      try {
        setBalance(await peakFinance.getStakedSharesOnMasonry());
      } catch (e) {
        console.error(e);
      }
    }
    if (isUnlocked) {
      fetchBalance();
    }
  }, [slowRefresh, isUnlocked, peakFinance]);
  return balance;
};

export default useStakedBalanceOnMasonry;
