import { useCallback } from 'react';
import usePeakFinance from './usePeakFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useWithdrawFromMasonry = () => {
  const peakFinance = usePeakFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleWithdraw = useCallback(
    (amount: string) => {
      handleTransactionReceipt(
        peakFinance.withdrawShareFromMasonry(amount),
        `Withdraw ${amount} PSHARE from the masonry`,
      );
    },
    [peakFinance, handleTransactionReceipt],
  );
  return { onWithdraw: handleWithdraw };
};

export default useWithdrawFromMasonry;
