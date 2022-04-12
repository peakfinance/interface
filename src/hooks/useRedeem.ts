import { useCallback } from 'react';
import usePeakFinance from './usePeakFinance';
import { Bank } from '../peak-finance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useRedeem = (bank: Bank) => {
  const peakFinance = usePeakFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleRedeem = useCallback(() => {
    handleTransactionReceipt(peakFinance.exit(bank.contract, bank.poolId), `Redeem ${bank.contract}`);
  }, [bank, peakFinance, handleTransactionReceipt]);

  return { onRedeem: handleRedeem };
};

export default useRedeem;
