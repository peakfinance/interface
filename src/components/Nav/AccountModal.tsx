import React, { useMemo } from 'react';
import styled from 'styled-components';
import useTokenBalance from '../../hooks/useTokenBalance';
import { getDisplayBalance } from '../../utils/formatBalance';

import Label from '../Label';
import Modal, { ModalProps } from '../Modal';
import ModalTitle from '../ModalTitle';
import usePeakFinance from '../../hooks/usePeakFinance';
import TokenSymbol from '../TokenSymbol';

const AccountModal: React.FC<ModalProps> = ({ onDismiss }) => {
  const peakFinance = usePeakFinance();

  const peakBalance = useTokenBalance(peakFinance.PEAK);
  const displayPeakBalance = useMemo(() => getDisplayBalance(peakBalance), [peakBalance]);

  const pshareBalance = useTokenBalance(peakFinance.PSHARE);
  const displayPshareBalance = useMemo(() => getDisplayBalance(pshareBalance), [pshareBalance]);

  const pbondBalance = useTokenBalance(peakFinance.PBOND);
  const displayPbondBalance = useMemo(() => getDisplayBalance(pbondBalance), [pbondBalance]);

  return (
    <Modal>
      <ModalTitle text="My Wallet" />

      <Balances>
        <StyledBalanceWrapper>
          <TokenSymbol symbol="PEAK" />
          <StyledBalance>
            <StyledValue>{displayPeakBalance}</StyledValue>
            <Label text="PEAK Available" />
          </StyledBalance>
        </StyledBalanceWrapper>

        <StyledBalanceWrapper>
          <TokenSymbol symbol="PRO" />
          <StyledBalance>
            <StyledValue>{displayPshareBalance}</StyledValue>
            <Label text="PRO Available" />
          </StyledBalance>
        </StyledBalanceWrapper>

        <StyledBalanceWrapper>
          <TokenSymbol symbol="POND" />
          <StyledBalance>
            <StyledValue>{displayPbondBalance}</StyledValue>
            <Label text="POND Available" />
          </StyledBalance>
        </StyledBalanceWrapper>
      </Balances>
    </Modal>
  );
};

const StyledValue = styled.div`
  //color: ${(props) => props.theme.color.grey[300]};
  font-size: 30px;
  font-weight: 700;
`;

const StyledBalance = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const Balances = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-bottom: ${(props) => props.theme.spacing[4]}px;
`;

const StyledBalanceWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin: 0 ${(props) => props.theme.spacing[3]}px;
`;

export default AccountModal;
