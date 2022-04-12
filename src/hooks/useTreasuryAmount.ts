import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import usePeakFinance from './usePeakFinance';

const useTreasuryAmount = () => {
  const [amount, setAmount] = useState(BigNumber.from(0));
  const peakFinance = usePeakFinance();

  useEffect(() => {
    if (peakFinance) {
      const { Treasury } = peakFinance.contracts;
      peakFinance.PEAK.balanceOf(Treasury.address).then(setAmount);
    }
  }, [peakFinance]);
  return amount;
};

export default useTreasuryAmount;
