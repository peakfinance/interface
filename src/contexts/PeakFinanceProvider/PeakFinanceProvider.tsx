import React, { createContext, useEffect, useState } from 'react';
import { useWallet } from 'use-wallet';
import PeakFinance from '../../peak-finance';
import config from '../../config';

export interface PeakFinanceContext {
  peakFinance?: PeakFinance;
}

export const Context = createContext<PeakFinanceContext>({ peakFinance: null });

export const PeakFinanceProvider: React.FC = ({ children }) => {
  const { ethereum, account } = useWallet();
  const [peakFinance, setPeakFinance] = useState<PeakFinance>();

  useEffect(() => {
    if (!peakFinance) {
      const peak = new PeakFinance(config);
      if (account) {
        // wallet was unlocked at initialization
        peak.unlockWallet(ethereum, account);
      }
      setPeakFinance(peak);
    } else if (account) {
      peakFinance.unlockWallet(ethereum, account);
    }
  }, [account, ethereum, peakFinance]);

  return <Context.Provider value={{ peakFinance }}>{children}</Context.Provider>;
};
