import React, { useState, useMemo } from 'react';

import { Button, Select, MenuItem, InputLabel, Typography, withStyles } from '@material-ui/core';
// import Button from '../../../components/Button'
import Modal, { ModalProps } from '../../../components/Modal';
import ModalActions from '../../../components/ModalActions';
import ModalTitle from '../../../components/ModalTitle';
import TokenInput from '../../../components/TokenInput';
import styled from 'styled-components';

import { getDisplayBalance } from '../../../utils/formatBalance';
import Label from '../../../components/Label';
import useLpStats from '../../../hooks/useLpStats';
import useTokenBalance from '../../../hooks/useTokenBalance';
import usePeakFinance from '../../../hooks/usePeakFinance';
import { useWallet } from 'use-wallet';
import useApproveZapper, { ApprovalState } from '../../../hooks/useApproveZapper';
import { PEAK_TICKER, PSHARE_TICKER, METIS_TICKER } from '../../../utils/constants';
import { Alert } from '@material-ui/lab';

interface ZapProps extends ModalProps {
  onConfirm: (zapAsset: string, lpName: string, amount: string) => void;
  tokenName?: string;
  decimals?: number;
}

const ZapModal: React.FC<ZapProps> = ({ onConfirm, onDismiss, tokenName = '', decimals = 18 }) => {
  const peakFinance = usePeakFinance();
  const { balance } = useWallet();
  const metisBalance = (Number(balance) / 1e18).toFixed(4).toString();
  const peakBalance = useTokenBalance(peakFinance.PEAK);
  const pshareBalance = useTokenBalance(peakFinance.PSHARE);
  const [val, setVal] = useState('');
  const [zappingToken, setZappingToken] = useState(METIS_TICKER);
  const [zappingTokenBalance, setZappingTokenBalance] = useState(metisBalance);
  const [estimate, setEstimate] = useState({ token0: '0', token1: '0' }); // token0 will always be METIS in this case
  const [approveZapperStatus, approveZapper] = useApproveZapper(zappingToken);
  const peakMetisLpStats = useLpStats('PEAK-METIS-LP');
  const pShareMetisLpStats = useLpStats('PRO-METIS-LP');
  const peakLPStats = useMemo(() => (peakMetisLpStats ? peakMetisLpStats : null), [peakMetisLpStats]);
  const pshareLPStats = useMemo(() => (pShareMetisLpStats ? pShareMetisLpStats : null), [pShareMetisLpStats]);
  const metisAmountPerLP = tokenName.startsWith(PEAK_TICKER) ? peakLPStats?.metisAmount : pshareLPStats?.metisAmount;
  /**
   * Checks if a value is a valid number or not
   * @param n is the value to be evaluated for a number
   * @returns
   */
  function isNumeric(n: any) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  const handleChangeAsset = (event: any) => {
    const value = event.target.value;
    setZappingToken(value);
    setZappingTokenBalance(metisBalance);
    if (event.target.value === PSHARE_TICKER) {
      setZappingTokenBalance(getDisplayBalance(pshareBalance, decimals));
    }
    if (event.target.value === PEAK_TICKER) {
      setZappingTokenBalance(getDisplayBalance(peakBalance, decimals));
    }
  };

  const handleChange = async (e: any) => {
    if (e.currentTarget.value === '' || e.currentTarget.value === 0) {
      setVal(e.currentTarget.value);
      setEstimate({ token0: '0', token1: '0' });
    }
    if (!isNumeric(e.currentTarget.value)) return;
    setVal(e.currentTarget.value);
    const estimateZap = await peakFinance.estimateZapIn(zappingToken, tokenName, String(e.currentTarget.value));
    setEstimate({ token0: estimateZap[0].toString(), token1: estimateZap[1].toString() });
  };

  const handleSelectMax = async () => {
    setVal(zappingTokenBalance);
    const estimateZap = await peakFinance.estimateZapIn(zappingToken, tokenName, String(zappingTokenBalance));
    setEstimate({ token0: estimateZap[0].toString(), token1: estimateZap[1].toString() });
  };

  return (
    <Modal>
      <ModalTitle text={`Zap in ${tokenName}`} />
      <Typography variant="h6" align="center">
        Powered by{' '}
        <a target="_blank" rel="noopener noreferrer" href="https://mlnl.finance">
          mlnl.finance
        </a>
      </Typography>

      <StyledActionSpacer />
      <InputLabel style={{ color: '#FFF' }} id="label">
        Select asset to zap with
      </InputLabel>
      <Select
        onChange={handleChangeAsset}
        style={{ color: '#FFF' }}
        labelId="label"
        id="select"
        value={zappingToken}
      >
        <StyledMenuItem value={METIS_TICKER}>METIS</StyledMenuItem>
        <StyledMenuItem value={PSHARE_TICKER}>PSHARE</StyledMenuItem>
        {/* Peak as an input for zapping will be disabled due to issues occuring with the Gatekeeper system */}
        {/* <StyledMenuItem value={PEAK_TICKER}>PEAK</StyledMenuItem> */}
      </Select>
      <TokenInput
        onSelectMax={handleSelectMax}
        onChange={handleChange}
        value={val}
        max={zappingTokenBalance}
        symbol={zappingToken}
      />
      <Label text="Zap Estimations" />
      <StyledDescriptionText>
        {' '}
        {tokenName}: {Number(estimate.token0) / Number(metisAmountPerLP)}
      </StyledDescriptionText>
      <StyledDescriptionText>
        {' '}
        ({Number(estimate.token0)} {METIS_TICKER} / {Number(estimate.token1)}{' '}
        {tokenName.startsWith(PEAK_TICKER) ? PEAK_TICKER : PSHARE_TICKER}){' '}
      </StyledDescriptionText>
      <ModalActions>
        <Button
          color="primary"
          variant="contained"
          onClick={() =>
            approveZapperStatus !== ApprovalState.APPROVED ? approveZapper() : onConfirm(zappingToken, tokenName, val)
          }
        >
          {approveZapperStatus !== ApprovalState.APPROVED ? 'Approve' : "Let's go"}
        </Button>
      </ModalActions>

      <StyledActionSpacer />
      <Alert variant="filled" severity="warning">
        Beta feature. Use at your own risk!
      </Alert>
    </Modal>
  );
};

const StyledActionSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
  width: ${(props) => props.theme.spacing[4]}px;
`;

const StyledDescriptionText = styled.div`
  align-items: center;
  color: ${(props) => props.theme.color.grey[400]};
  display: flex;
  font-size: 14px;
  font-weight: 700;
  height: 22px;
  justify-content: flex-start;
`;
const StyledMenuItem = withStyles({
  root: {
    backgroundColor: 'white',
    color: '#FFF',
    '&:hover': {
      backgroundColor: 'grey',
      color: '#FFF',
    },
    selected: {
      backgroundColor: 'black',
    },
  },
})(MenuItem);

export default ZapModal;
