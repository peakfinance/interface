import { useCallback } from 'react';
import usePeakFinance from './usePeakFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { Bank } from '../peak-finance';

const useHarvest = (bank: Bank) => {
  const peakFinance = usePeakFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleReward = useCallback(() => {
    handleTransactionReceipt(
      peakFinance.harvest(bank.contract, bank.poolId),
      `Claim ${bank.earnTokenName} from ${bank.contract}`,
    );
  }, [bank, peakFinance, handleTransactionReceipt]);

  return { onReward: handleReward };
};

export default useHarvest;
