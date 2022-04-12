import { useCallback } from 'react';
import usePeakFinance from './usePeakFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useStakeToMasonry = () => {
  const peakFinance = usePeakFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleStake = useCallback(
    (amount: string) => {
      handleTransactionReceipt(peakFinance.stakeShareToMasonry(amount), `Stake ${amount} PRO to the summit. `);
    },
    [peakFinance, handleTransactionReceipt],
  );
  return { onStake: handleStake };
};

export default useStakeToMasonry;
