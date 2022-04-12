import { useEffect, useState } from 'react';
import usePeakFinance from './../usePeakFinance';
import useRefresh from '../useRefresh';

const useWithdrawCheck = () => {
  const [canWithdraw, setCanWithdraw] = useState(false);
  const peakFinance = usePeakFinance();
  const { slowRefresh } = useRefresh();
  const isUnlocked = peakFinance?.isUnlocked;

  useEffect(() => {
    async function canUserWithdraw() {
      try {
        setCanWithdraw(await peakFinance.canUserUnstakeFromMasonry());
      } catch (err) {
        console.error(err);
      }
    }
    if (isUnlocked) {
      canUserWithdraw();
    }
  }, [isUnlocked, peakFinance, slowRefresh]);

  return canWithdraw;
};

export default useWithdrawCheck;
