import React, { useMemo, useState } from 'react';
import Page from '../../components/Page';
import { createGlobalStyle } from 'styled-components';
import useLpStats from '../../hooks/useLpStats';
import { Box, Button, Grid, Paper, Typography } from '@material-ui/core';
import usePeakStats from '../../hooks/usePeakStats';
import TokenInput from '../../components/TokenInput';
import usePeakFinance from '../../hooks/usePeakFinance';
import { useWallet } from 'use-wallet';
import useTokenBalance from '../../hooks/useTokenBalance';
import { getDisplayBalance } from '../../utils/formatBalance';
import useApproveTaxOffice from '../../hooks/useApproveTaxOffice';
import { ApprovalState } from '../../hooks/useApprove';
import useProvidePeakMetisLP from '../../hooks/useProvidePeakMetisLP';
import { makeStyles } from '@material-ui/core/styles';
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
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
const useStyles = makeStyles((theme) => ({
  transparentGradientBox: {
    background: 'linear-gradient(to bottom left, #00000000 40%, #19bea260)',
  },
  transparentGradientBoxes: {
    background: 'linear-gradient(to bottom left, #00000060 30%, #19bea280)',
    borderRadius: 15,
  },
  alertBox: {
    display: 'flex',
    justifyContent: 'center'
  },
  alertText: {
    color: 'black'
  },
  blackText: {
    color: 'black'
  }
}));

const ProvideLiquidity = () => {
  const [peakAmount, setPeakAmount] = useState(0);
  const [metisAmount, setMetisAmount] = useState(0);
  const [lpTokensAmount, setLpTokensAmount] = useState(0);
  const { balance } = useWallet();
  const peakStats = usePeakStats();
  const peakFinance = usePeakFinance();
  const [approveTaxOfficeStatus, approveTaxOffice] = useApproveTaxOffice();
  const peakBalance = useTokenBalance(peakFinance.PEAK);
  const metisBalance = (balance / 1e18).toFixed(4);
  const { onProvidePeakMetisLP } = useProvidePeakMetisLP();
  const peakMetisLpStats = useLpStats('PEAK-METIS-LP');

  const peakLPStats = useMemo(() => (peakMetisLpStats ? peakMetisLpStats : null), [peakMetisLpStats]);
  const peakPriceInMETIS = useMemo(() => (peakStats ? Number(peakStats.tokenInMetis).toFixed(2) : null), [peakStats]);
  const metisPriceInPEAK = useMemo(() => (peakStats ? Number(1 / peakStats.tokenInMetis).toFixed(2) : null), [peakStats]);
  const classes = useStyles();



  const handlePeakChange = async (e) => {
    if (e.currentTarget.value === '' || e.currentTarget.value === 0) {
      setPeakAmount(e.currentTarget.value);
    }
    if (!isNumeric(e.currentTarget.value)) return;
    setPeakAmount(e.currentTarget.value);
    const quoteFromNetSwap = await peakFinance.quoteFromNetSwap(e.currentTarget.value, 'PEAK');
    setMetisAmount(quoteFromNetSwap);
    setLpTokensAmount(quoteFromNetSwap / peakLPStats.metisAmount);
  };

  const handleMetisChange = async (e) => {
    if (e.currentTarget.value === '' || e.currentTarget.value === 0) {
      setMetisAmount(e.currentTarget.value);
    }
    if (!isNumeric(e.currentTarget.value)) return;
    setMetisAmount(e.currentTarget.value);
    const quoteFromNetSwap = await peakFinance.quoteFromNetSwap(e.currentTarget.value, 'METIS');
    setPeakAmount(quoteFromNetSwap);

    setLpTokensAmount(quoteFromNetSwap / peakLPStats.tokenAmount);
  };
  const handlePeakSelectMax = async () => {
    const quoteFromNetSwap = await peakFinance.quoteFromNetSwap(getDisplayBalance(peakBalance), 'PEAK');
    setPeakAmount(getDisplayBalance(peakBalance));
    setMetisAmount(quoteFromNetSwap);
    setLpTokensAmount(quoteFromNetSwap / peakLPStats.metisAmount);
  };
  const handleMetisSelectMax = async () => {
    const quoteFromNetSwap = await peakFinance.quoteFromNetSwap(metisBalance, 'METIS');
    setMetisAmount(metisBalance);
    setPeakAmount(quoteFromNetSwap);
    setLpTokensAmount(metisBalance / peakLPStats.metisAmount);
  };
  return (
    <Page>
      <BackgroundImage />
      <Typography align="center" variant="h3" gutterBottom>
        Provide Liquidity
      </Typography>

      <Grid container justify="center">
        <Box style={{ width: '600px' }}>
          <Paper className={classes.alertBox} style={{ background: '#19bea2', padding: '10px 20px',  }}>
            <b className={classes.blackText}>This and <a href="https://netswap.io/#/pool"  rel="noopener noreferrer" target="_blank">Netswap </a> are the only ways to provide Liquidity on PEAK-METIS pair without paying tax.</b>
          </Paper>
          <Grid item xs={12} sm={12}>
            <Paper className={classes.transparentGradientBoxes}>
              <Box mt={4} >
                <Grid item xs={12} sm={12} style={{ borderRadius: 15 }}>
                  <Box p={4}>
                    <Grid container>
                      <Grid item xs={12}>
                        <TokenInput
                          onSelectMax={handlePeakSelectMax}
                          onChange={handlePeakChange}
                          value={peakAmount}
                          max={getDisplayBalance(peakBalance)}
                          symbol={'PEAK'}
                        ></TokenInput>
                      </Grid>
                      <Grid item xs={12}>
                        <TokenInput
                          onSelectMax={handleMetisSelectMax}
                          onChange={handleMetisChange}
                          value={metisAmount}
                          max={metisBalance}
                          symbol={'METIS'}
                        ></TokenInput>
                      </Grid>
                      <Grid item xs={12}>
                        <p>1 PEAK = {peakPriceInMETIS} METIS</p>
                        <p>1 METIS = {metisPriceInPEAK} PEAK</p>
                        <p>LP tokens ≈ {lpTokensAmount.toFixed(2)}</p>
                      </Grid>
                      <Grid xs={12} justifyContent="center" style={{ textAlign: 'center' }}>
                        {approveTaxOfficeStatus === ApprovalState.APPROVED ? (
                          <Button
                            variant="contained"
                            onClick={() => onProvidePeakMetisLP(metisAmount.toString(), peakAmount.toString())}
                            color="primary"
                            style={{ margin: '0 10px', color: '#fff' }}
                          >
                            Supply
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            onClick={() => approveTaxOffice()}
                            color="primary"
                            // style={{ margin: '0 10px', background: '#19bea280' }}
                          >
                            Approve
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Box>
      </Grid>
    </Page>
  );
};

export default ProvideLiquidity;
