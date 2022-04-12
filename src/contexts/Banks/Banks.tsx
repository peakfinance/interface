import React, { useCallback, useEffect, useState } from 'react';
import Context from './context';
import usePeakFinance from '../../hooks/usePeakFinance';
import { Bank } from '../../peak-finance';
import config, { bankDefinitions } from '../../config';

const Banks: React.FC = ({ children }) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const peakFinance = usePeakFinance();
  const isUnlocked = peakFinance?.isUnlocked;

  const fetchPools = useCallback(async () => {
    const banks: Bank[] = [];

    for (const bankInfo of Object.values(bankDefinitions)) {
      if (bankInfo.finished) {
        if (!peakFinance.isUnlocked) continue;

        // only show pools staked by user
        const balance = await peakFinance.stakedBalanceOnBank(
          bankInfo.contract,
          bankInfo.poolId,
          peakFinance.myAccount,
        );
        if (balance.lte(0)) {
          continue;
        }
      }
      banks.push({
        ...bankInfo,
        address: config.deployments[bankInfo.contract].address,
        depositToken: peakFinance.externalTokens[bankInfo.depositTokenName],
        earnToken: bankInfo.earnTokenName === 'PEAK' ? peakFinance.PEAK : peakFinance.PSHARE,
      });
    }
    banks.sort((a, b) => (a.sort > b.sort ? 1 : -1));
    setBanks(banks);
  }, [peakFinance, setBanks]);

  useEffect(() => {
    if (peakFinance) {
      fetchPools().catch((err) => console.error(`Failed to fetch pools: ${err.stack}`));
    }
  }, [isUnlocked, peakFinance, fetchPools]);

  return <Context.Provider value={{ banks }}>{children}</Context.Provider>;
};

export default Banks;
