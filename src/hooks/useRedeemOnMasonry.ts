import { useCallback } from 'react';
import usePeakFinance from './usePeakFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useRedeemOnMasonry = (description?: string) => {
  const peakFinance = usePeakFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleRedeem = useCallback(() => {
    const alertDesc = description || 'Redeem PSHARE from The Summit';
    handleTransactionReceipt(peakFinance.exitFromMasonry(), alertDesc);
  }, [peakFinance, description, handleTransactionReceipt]);
  return { onRedeem: handleRedeem };
};

export default useRedeemOnMasonry;
