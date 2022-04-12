import React, { /*useCallback, useEffect, */useMemo, useState } from 'react';
import Page from '../../components/Page';
import PitImage from '../../assets/img/pit.png';
import { createGlobalStyle } from 'styled-components';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useWallet } from 'use-wallet';
import UnlockWallet from '../../components/UnlockWallet';
import PageHeader from '../../components/PageHeader';
import { Box,/* Paper, Typography,*/ Button, Grid } from '@material-ui/core';
import styled from 'styled-components';
import Spacer from '../../components/Spacer';
import usePeakFinance from '../../hooks/usePeakFinance';
import { getDisplayBalance/*, getBalance*/ } from '../../utils/formatBalance';
import { BigNumber/*, ethers*/ } from 'ethers';
import useSwapPBondToPShare from '../../hooks/PShareSwapper/useSwapPBondToPShare';
import useApprove, { ApprovalState } from '../../hooks/useApprove';
import usePShareSwapperStats from '../../hooks/PShareSwapper/usePShareSwapperStats';
import TokenInput from '../../components/TokenInput';
import Card from '../../components/Card';
import CardContent from '../../components/CardContent';
import TokenSymbol from '../../components/TokenSymbol';
import SecondaryBg from '../../assets/img/secondary_bg.jpeg';
import HomeImage from '../../assets/img/home_bg.jpeg';

const BackgroundImage = createGlobalStyle`
  body {
    background: url(${HomeImage}) no-repeat !important;
    background-size: cover !important;
    background-position: center !important;
    backdrop-filter: blur(5px);
  }
`;

function isNumeric(n: any) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

const Sbs: React.FC = () => {
  const { path } = useRouteMatch();
  const { account } = useWallet();
  const peakFinance = usePeakFinance();
  const [pbondAmount, setPbondAmount] = useState('');
  const [pshareAmount, setPshareAmount] = useState('');

  const [approveStatus, approve] = useApprove(peakFinance.PBOND, peakFinance.contracts.PShareSwapper.address);
  const { onSwapPShare } = useSwapPBondToPShare();
  const pshareSwapperStat = usePShareSwapperStats(account);

  const pshareBalance = useMemo(() => (pshareSwapperStat ? Number(pshareSwapperStat.pshareBalance) : 0), [pshareSwapperStat]);
  const bondBalance = useMemo(() => (pshareSwapperStat ? Number(pshareSwapperStat.pbondBalance) : 0), [pshareSwapperStat]);

  const handlePBondChange = async (e: any) => {
    if (e.currentTarget.value === '') {
      setPbondAmount('');
      setPshareAmount('');
      return
    }
    if (!isNumeric(e.currentTarget.value)) return;
    setPbondAmount(e.currentTarget.value);
    const updatePShareAmount = await peakFinance.estimateAmountOfPShare(e.currentTarget.value);
    setPshareAmount(updatePShareAmount);  
  };

  const handlePBondSelectMax = async () => {
    setPbondAmount(String(bondBalance));
    const updatePShareAmount = await peakFinance.estimateAmountOfPShare(String(bondBalance));
    setPshareAmount(updatePShareAmount); 
  };

  const handlePShareSelectMax = async () => {
    setPshareAmount(String(pshareBalance));
    const ratePSharePerPeak = (await peakFinance.getPShareSwapperStat(account)).ratePSharePerPeak;
    const updatePBondAmount = ((BigNumber.from(10).pow(30)).div(BigNumber.from(ratePSharePerPeak))).mul(Number(pshareBalance) * 1e6);
    setPbondAmount(getDisplayBalance(updatePBondAmount, 18, 6));
  };

  const handlePShareChange = async (e: any) => {
    const inputData = e.currentTarget.value;
    if (inputData === '') {
      setPshareAmount('');
      setPbondAmount('');
      return
    }
    if (!isNumeric(inputData)) return;
    setPshareAmount(inputData);
    const ratePSharePerPeak = (await peakFinance.getPShareSwapperStat(account)).ratePSharePerPeak;
    const updatePBondAmount = ((BigNumber.from(10).pow(30)).div(BigNumber.from(ratePSharePerPeak))).mul(Number(inputData) * 1e6);
    setPbondAmount(getDisplayBalance(updatePBondAmount, 18, 6));
  }

  return (
    <Switch>
      <Page>
        <BackgroundImage />
        {!!account ? (
          <>
            <Route exact path={path}>
              <PageHeader icon={'🏦'} title="POND -> PRO Swap" subtitle="Swap POND to PRO" />
            </Route>
            <Box mt={5}>
              <Grid container justify="center" spacing={6}>
                <StyledBoardroom>
                  <StyledCardsWrapper>
                    <StyledCardWrapper>
                      <Card>
                        <CardContent>
                          <StyledCardContentInner>
                            <StyledCardTitle>POND</StyledCardTitle>
                            <StyledExchanger>
                              <StyledToken>
                                <StyledCardIcon>
                                  <TokenSymbol symbol={peakFinance.PBOND.symbol} size={75} />
                                </StyledCardIcon>
                              </StyledToken>
                            </StyledExchanger>
                            <Grid item xs={12}>
                              <TokenInput
                                onSelectMax={handlePBondSelectMax}
                                onChange={handlePBondChange}
                                value={pbondAmount}
                                max={bondBalance}
                                symbol="POND"
                              ></TokenInput>
                            </Grid>
                            <StyledDesc>{`${bondBalance} POND Available in Wallet`}</StyledDesc>
                          </StyledCardContentInner>
                        </CardContent>
                      </Card>
                    </StyledCardWrapper>
                    <Spacer size="lg"/>
                    <StyledCardWrapper>
                      <Card>
                        <CardContent>
                          <StyledCardContentInner>
                            <StyledCardTitle>PRO</StyledCardTitle>
                            <StyledExchanger>
                              <StyledToken>
                                <StyledCardIcon>
                                  <TokenSymbol symbol={peakFinance.PSHARE.symbol} size={75} />
                                </StyledCardIcon>
                              </StyledToken>
                            </StyledExchanger>
                            <Grid item xs={12}>
                              <TokenInput
                                onSelectMax={handlePShareSelectMax}
                                onChange={handlePShareChange}
                                value={pshareAmount}
                                max={pshareBalance}
                                symbol="PRO"
                              ></TokenInput>
                            </Grid>
                            <StyledDesc>{`${pshareBalance} PRO Available in Swapper`}</StyledDesc>
                          </StyledCardContentInner>
                        </CardContent>
                      </Card>
              
                    </StyledCardWrapper>
                  </StyledCardsWrapper>
                </StyledBoardroom>
              </Grid>
            </Box>

            <Box mt={5}>
              <Grid container justify="center">
                <Grid item xs={8}>
                  <Card>
                    <CardContent>
                      <StyledApproveWrapper>
                      {approveStatus !== ApprovalState.APPROVED ? (
                        <Button
                          disabled={approveStatus !== ApprovalState.NOT_APPROVED}
                          color="primary"
                          variant="contained"
                          onClick={approve}
                          size="medium"
                        >
                          Approve POND
                        </Button>
                      ) : (
                        <Button
                          color="primary"
                          variant="contained"
                          onClick={() => onSwapPShare(pbondAmount.toString())}
                          size="medium"
                        >
                          Swap
                        </Button>
                      )}
                      </StyledApproveWrapper>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </>
        ) : (
          <UnlockWallet />
        )}
      </Page>
    </Switch>
  );
};

const StyledBoardroom = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledCardsWrapper = styled.div`
  display: flex;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`;

const StyledCardWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledApproveWrapper = styled.div`
  margin-left: auto;
  margin-right: auto;
`;
const StyledCardTitle = styled.div`
  align-items: center;
  display: flex;
  font-size: 20px;
  font-weight: 700;
  height: 64px;
  justify-content: center;
  margin-top: ${(props) => -props.theme.spacing[3]}px;
`;

const StyledCardIcon = styled.div`
  width: 75px;
  height: 75px;
  border-radius: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${(props) => props.theme.spacing[2]}px;
`;

const StyledExchanger = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: ${(props) => props.theme.spacing[5]}px;
`;

const StyledToken = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  font-weight: 600;
`;

const StyledCardContentInner = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
`;

const StyledDesc = styled.span``;

export default Sbs;
