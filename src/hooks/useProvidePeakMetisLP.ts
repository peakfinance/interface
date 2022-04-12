import { useCallback } from 'react';
import usePeakFinance from './usePeakFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { parseUnits } from 'ethers/lib/utils';
import { TAX_OFFICE_ADDR } from './../utils/constants'

const useProvidePeakMetisLP = () => {
  const peakFinance = usePeakFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleProvidePeakMetisLP = useCallback(
    (metisAmount: string, peakAmount: string) => {
      const peakAmountBn = parseUnits(peakAmount);
      handleTransactionReceipt(
        peakFinance.providePeakMetisLP(metisAmount, peakAmountBn),
        `Provide Peak-METIS LP ${peakAmount} ${metisAmount} using ${TAX_OFFICE_ADDR}`,
      );
    },
    [peakFinance, handleTransactionReceipt],
  );
  return { onProvidePeakMetisLP: handleProvidePeakMetisLP };
};

export default useProvidePeakMetisLP;
