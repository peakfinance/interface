import { useCallback, useEffect, useState } from 'react';
import usePeakFinance from './usePeakFinance';
import config from '../config';
import { BigNumber } from 'ethers';

const useCashPriceInLastTWAP = () => {
  const [price, setPrice] = useState<BigNumber>(BigNumber.from(0));
  const peakFinance = usePeakFinance();

  const fetchCashPrice = useCallback(async () => {
    setPrice(await peakFinance.getPeakPriceInLastTWAP());
  }, [peakFinance]);

  useEffect(() => {
    fetchCashPrice().catch((err) => console.error(`Failed to fetch PEAK price: ${err.stack}`));
    const refreshInterval = setInterval(fetchCashPrice, config.refreshInterval);
    return () => clearInterval(refreshInterval);
  }, [setPrice, peakFinance, fetchCashPrice]);

  return price;
};

export default useCashPriceInLastTWAP;
