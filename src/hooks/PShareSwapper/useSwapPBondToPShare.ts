import { useCallback } from 'react';
import usePeakFinance from '../usePeakFinance';
import useHandleTransactionReceipt from '../useHandleTransactionReceipt';
// import { BigNumber } from "ethers";
import { parseUnits } from 'ethers/lib/utils';


const useSwapPBondToPShare = () => {
  const peakFinance = usePeakFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleSwapPShare = useCallback(
  	(pbondAmount: string) => {
	  	const pbondAmountBn = parseUnits(pbondAmount, 18);
	  	handleTransactionReceipt(
	  		peakFinance.swapPBondToPShare(pbondAmountBn),
	  		`Swap ${pbondAmount} PBond to PShare`
	  	);
  	},
  	[peakFinance, handleTransactionReceipt]
  );
  return { onSwapPShare: handleSwapPShare };
};

export default useSwapPBondToPShare;