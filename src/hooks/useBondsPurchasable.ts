import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import ERC20 from '../peak-finance/ERC20';
import usePeakFinance from './usePeakFinance';
import config from '../config';

const useBondsPurchasable = () => {
  const [balance, setBalance] = useState(BigNumber.from(0));
  const peakFinance = usePeakFinance();

  useEffect(() => {
    async function fetchBondsPurchasable() {
        try {
            setBalance(await peakFinance.gepBondsPurchasable());
        }
        catch(err) {
            console.error(err);
        }
      }
    fetchBondsPurchasable();
  }, [setBalance, peakFinance]);

  return balance;
};

export default useBondsPurchasable;
