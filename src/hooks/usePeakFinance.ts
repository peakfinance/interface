import { useContext } from 'react';
import { Context } from '../contexts/PeakFinanceProvider';

const usePeakFinance = () => {
  const { peakFinance } = useContext(Context);
  return peakFinance;
};

export default usePeakFinance;
