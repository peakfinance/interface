import React, { useMemo } from 'react';
import Page from '../../components/Page';
import HomeImage from '../../assets/img/home_bg.jpeg';
import PeakImg from '../../assets/img/peak_fin.png';
import PeakImgBlack from '../../assets/img/peak-logo-full.png';
import PondsImgBlack from '../../assets/img/ponds.png';
import ProImgBlack from '../../assets/img/pro.png';
import RugDocImage from '../../assets/img/rugdoc.png'
import InterfiImage from '../../assets/img/interfi.png'


import PeakCircle from '../../assets/img/peakcircle.png';

import Image from 'material-ui-image';
import styled from 'styled-components';
import { Alert } from '@material-ui/lab';
import { createGlobalStyle } from 'styled-components';
import CountUp from 'react-countup';
import CardIcon from '../../components/CardIcon';
import TokenSymbol from '../../components/TokenSymbol';
import usePeakStats from '../../hooks/usePeakStats';
import useLpStats from '../../hooks/useLpStats';
import useModal from '../../hooks/useModal';
import useZap from '../../hooks/useZap';
import useBondStats from '../../hooks/useBondStats';
import usepShareStats from '../../hooks/usepShareStats';
import useTotalValueLocked from '../../hooks/useTotalValueLocked';
import { peak as peakTesting, pShare as pShareTesting } from '../../peak-finance/deployments/deployments.testing.json';
import { peak as peakProd, pShare as pShareProd } from '../../peak-finance/deployments/deployments.mainnet.json';

import MetamaskFox from '../../assets/img/metamask-fox.svg';

import { Box, Button, Card, CardContent, Grid, Paper } from '@material-ui/core';
import ZapModal from '../Bank/components/ZapModal';

import { makeStyles } from '@material-ui/core/styles';
import usePeakFinance from '../../hooks/usePeakFinance';

const BackgroundImage = createGlobalStyle`
  body {
    background: url(${HomeImage}) no-repeat !important;
    background-size: cover !important;
    background-position: center !important;
    backdrop-filter: blur(5px);
  }
`;

const useStyles = makeStyles((theme) => ({
  button: {
    [theme.breakpoints.down('415')]: {
      marginTop: '10px',
    },
  },
  transparentGradientBox: {
    background: 'linear-gradient(to bottom left, #00000000 40%, #19bea260)',
  },
  transparentGradientBoxes: {
    background: 'linear-gradient(to bottom left, #00000060 30%, #19bea280)',
    borderRadius: 15,
  },
  alertBox: {
    width: '50%',
    display: 'flex',
    justifyContent: 'center'
  },
  alertText: {
    color: 'black'
  },
}));

const Home = () => {
  const classes = useStyles();
  const TVL = useTotalValueLocked();
  const peakMetisLpStats = useLpStats('PEAK-METIS-LP');
  const pShareMetisLpStats = useLpStats('PRO-METIS-LP');
  const peakStats = usePeakStats();
  const pShareStats = usepShareStats();
  const pBondStats = useBondStats();
  const peakFinance = usePeakFinance();

  let peak;
  let pShare;
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    peak = peakTesting;
    pShare = pShareTesting;
  } else {
    peak = peakProd;
    pShare = pShareProd;
  }

  const buyPeakAddress = 'https://netswap.io/#/swap?inputCurrency=METIS&outputCurrency=' + peak.address;
  const buyPShareAddress = 'https://netswap.io/#/swap?inputCurrency=METIS&outputCurrency=' + pShare.address;

  const peakLPStats = useMemo(() => (peakMetisLpStats ? peakMetisLpStats : null), [peakMetisLpStats]);
  const pshareLPStats = useMemo(() => (pShareMetisLpStats ? pShareMetisLpStats : null), [pShareMetisLpStats]);
  const peakPriceInDollars = useMemo(
    () => (peakStats ? Number(peakStats.priceInDollars).toFixed(2) : null),
    [peakStats],
  );
  const peakPriceInMETIS = useMemo(() => (peakStats ? Number(peakStats.tokenInMetis).toFixed(4) : null), [peakStats]);
  const peakCirculatingSupply = useMemo(() => (peakStats ? String(peakStats.circulatingSupply) : null), [peakStats]);
  const peakTotalSupply = useMemo(() => (peakStats ? String(peakStats.totalSupply) : null), [peakStats]);

  const pSharePriceInDollars = useMemo(
    () => (pShareStats ? Number(pShareStats.priceInDollars).toFixed(2) : null),
    [pShareStats],
  );  
  const pSharePriceInMETIS = useMemo(
    () => (pShareStats ? Number(pShareStats.tokenInMetis).toFixed(4) : null),
    [pShareStats],
  );
  const pShareCirculatingSupply = useMemo(
    () => (pShareStats ? String(pShareStats.circulatingSupply) : null),
    [pShareStats],
  );
  const pShareTotalSupply = useMemo(() => (pShareStats ? String(pShareStats.totalSupply) : null), [pShareStats]);

  const pBondPriceInDollars = useMemo(
    () => (pBondStats ? Number(pBondStats.priceInDollars).toFixed(2) : null),
    [pBondStats],
  );
  const pBondPriceInMETIS = useMemo(() => (pBondStats ? Number(pBondStats.tokenInMetis).toFixed(4) : null), [pBondStats]);
  const pBondCirculatingSupply = useMemo(
    () => (pBondStats ? String(pBondStats.circulatingSupply) : null),
    [pBondStats],
  );
  const pBondTotalSupply = useMemo(() => (pBondStats ? String(pBondStats.totalSupply) : null), [pBondStats]);

  const peakLpZap = useZap({ depositTokenName: 'PEAK-METIS-LP' });
  const pshareLpZap = useZap({ depositTokenName: 'PRO-METIS-LP' });

  const StyledLink = styled.a`
    font-weight: 700;
    text-decoration: none;
  `;

  const [onPresentPeakZap, onDissmissPeakZap] = useModal(
    <ZapModal
      decimals={18}
      onConfirm={(zappingToken, tokenName, amount) => {
        if (Number(amount) <= 0 || isNaN(Number(amount))) return;
        peakLpZap.onZap(zappingToken, tokenName, amount);
        onDissmissPeakZap();
      }}
      tokenName={'PEAK-METIS-LP'}
    />,
  );

  const [onPresentPshareZap, onDissmissPshareZap] = useModal(
    <ZapModal
      decimals={18}
      onConfirm={(zappingToken, tokenName, amount) => {
        if (Number(amount) <= 0 || isNaN(Number(amount))) return;
        pshareLpZap.onZap(zappingToken, tokenName, amount);
        onDissmissPshareZap();
      }}
      tokenName={'PRO-METIS-LP'}
    />,
  );

  return (
    <Page>
      <BackgroundImage />
      <Grid container spacing={3}>
        {/* Logo */}
        <Grid container item xs={12} sm={4} justify="center" alignItems='center'>
          {/* <Paper>xs=6 sm=3</Paper> */}
          <Image color="none" style={{ width: '300px', height: '280px', paddingTop: '0px' }} src={PeakCircle} />
        </Grid>
        {/* Explanation text */}
        <Grid item xs={12} sm={8}>
          <Paper className={classes.transparentGradientBox} >
            <Box p={4}>
              <h2>Welcome to Peak Finance</h2>
              <p> The monetary layer of the Andromeda Ecosystem. A modified fork of Tomb that utilizes $PEAK as an inflationary payment currency and $PRO as the share token that captures revenue from diverse streams.</p>
              <a href="https://twitter.com/RugDocIO/status/1509538942412115976" target="_rel"><Image style={{display : 'inline-block', width: '150px', height: '75px', paddingTop: '10px', backgroundColor: 'transparent'}} src={RugDocImage} /></a>
              <a href="https://t.co/5MdBx1LR1N" target="_rel"><Image style={{display : 'inline-block', width: '190px', height: '75px', paddingTop: '10px', paddingRight: '10px', backgroundColor: 'transparent'}} src={InterfiImage} /></a>
            </Box>
          </Paper>
        </Grid>

        <Grid container spacing={3}>
          <Grid item  xs={12} sm={12} justify="center"  style={{ margin: '12px', display: 'flex' }}>
            <Paper className={classes.alertBox} style={{ background: 'black', padding: '10px 20px', width: '100%' }}>
              <h3 className={classes.alertText} style={{ color: 'white'}}>
                Earn PRO by adding liquidity to our <a style={{color:'#89CFF0'}} href="/thebasecamp/PshareMetisLPPShareRewardPool">METIS-PRO LP</a> or <a style={{color:'#89CFF0'}} href="/thebasecamp/PeakMetisLPPShareRewardPool">PEAK-METIS LP</a>.
              </h3>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item  xs={12} sm={12} justify="center"  style={{ margin: '12px', display: 'flex' }}>
            <Paper className={classes.alertBox} style={{ background: '#19bea2', padding: '10px 20px', width: '100%' }}>
              <b className={classes.alertText}>
                Please visit our <a href="https://peakfinance-dao.gitbook.io/" target="_rel">documentation</a> before purchasing PEAK or PRO!
              </b>
            </Paper>
          </Grid>
        </Grid>

        {/* TVL */}
        <Grid item xs={12} sm={4}>
          <Card className={classes.transparentGradientBoxes}>
            <CardContent align="center">
              <h2>Total Value Locked</h2>
              <CountUp style={{ fontSize: '25px' }} end={TVL} separator="," prefix="$" />
            </CardContent>
          </Card>
        </Grid>

        {/* Wallet */}
        <Grid item xs={12} sm={8}>
          <Card style={{ height: '100%' }} className={classes.transparentGradientBoxes}>
            <CardContent align="center" style={{ marginTop: '2.5%' }}>
              {/* <h2 style={{ marginBottom: '20px' }}>Wallet Balance</h2> */}
              <Button color="primary" href="/thebasecamp/PeakMetisLPPeakRewardPool" variant="contained" style={{ marginRight: '10px' }}>
                Stake Now
              </Button>
              <Button href="/thebasecamp" variant="contained" style={{ marginRight: '10px' }}>
                Farm Now
              </Button>
              <Button
                color="primary"
                target="_blank"
                href={buyPeakAddress}
                variant="contained"
                style={{ marginRight: '10px' }}
                className={classes.button}
              >
                Buy PEAK
  </Button>
              <Button 
                variant="contained" 
                target="_blank" 
                href={buyPShareAddress} 
                className={classes.button}
              >
                Buy PRO
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* PEAK */}
        <Grid item xs={12} sm={4}>
          <Card className={classes.transparentGradientBoxes} style={{ paddingBottom: 50 }}>
            <CardContent align="center" style={{ position: 'relative' }}>
              <h2>PEAK</h2>
              <Button
                onClick={() => {
                  peakFinance.watchAssetInMetamask('PEAK');
                }}
                color="primary"
                variant="outlined"
                style={{ position: 'absolute', top: '10px', right: '10px'}}
              >
                +&nbsp;
                <img alt="metamask fox" style={{ width: '20px' }} src={MetamaskFox} />
              </Button>
              <Box mt={2}>
                <CardIcon>
                  <Image style={{ width: '75px', height: '75px', paddingTop: '0px', backgroundColor: 'transparent'}} src={PeakImgBlack} />
                </CardIcon>
              </Box>
              Current Price
              <Box>
                <span style={{ fontSize: '30px' }}>{peakPriceInMETIS ? peakPriceInMETIS : '0.00'} METIS</span>
              </Box>
              <Box>
                <span style={{ fontSize: '16px', alignContent: 'flex-start' }}>
                  ${peakPriceInDollars ? peakPriceInDollars : '0.00'}
                </span>
              </Box>
              {/* <span style={{ fontSize: '12px' }}>
                Market Cap: ${(peakCirculatingSupply * peakPriceInDollars).toFixed(2)} <br />
                Circulating Supply: {peakCirculatingSupply} <br />
                Total Supply: {peakTotalSupply}
              </span> */}
            </CardContent>
          </Card>
        </Grid>

        {/* PRO */}
        <Grid item xs={12} sm={4}>
          <Card className={classes.transparentGradientBoxes} style={{ paddingBottom: 50 }}>
            <CardContent align="center" style={{ position: 'relative' }}>
              <h2>PRO</h2>
              <Button
                onClick={() => {
                  peakFinance.watchAssetInMetamask('PRO');
                }}
                color="primary"
                variant="outlined"
                style={{ position: 'absolute', top: '10px', right: '10px' }}
              >
                +&nbsp;
                <img alt="metamask fox" style={{ width: '20px' }} src={MetamaskFox} />
              </Button>
              <Box mt={2}>
                <CardIcon>
                  <Image style={{ width: '75px', height: '75px', paddingTop: '0px', backgroundColor: 'transparent'}} src={ProImgBlack} />
                </CardIcon>
              </Box>
              Current Price
              <Box>
                <span style={{ fontSize: '30px' }}>{pSharePriceInMETIS ? pSharePriceInMETIS : '0.00'} METIS</span>
              </Box>
              <Box>
                <span style={{ fontSize: '16px' }}>${pSharePriceInDollars ? pSharePriceInDollars : '0.00'}</span>
              </Box>
              {/* <span style={{ fontSize: '12px' }}>
                Market Cap: ${(pShareCirculatingSupply * pSharePriceInDollars).toFixed(2)} <br />
                Circulating Supply: {pShareCirculatingSupply} <br />
                Total Supply: {pShareTotalSupply}
              </span> */}
            </CardContent>
          </Card>
        </Grid>

        {/* PBOND */}
        <Grid item xs={12} sm={4}>
          <Card className={classes.transparentGradientBoxes} style={{ paddingBottom: 50 }}>
            <CardContent align="center" style={{ position: 'relative' }}>
              <h2>POND</h2>
              <Button
                onClick={() => {
                  peakFinance.watchAssetInMetamask('POND');
                }}
                color="primary"
                variant="outlined"
                style={{ position: 'absolute', top: '10px', right: '10px' }}
              >
                +&nbsp;
                <img alt="metamask fox" style={{ width: '20px' }} src={MetamaskFox} />
              </Button>
              <Box mt={2}>
                <CardIcon>
                  <Image style={{ width: '75px', height: '75px', paddingTop: '0px', backgroundColor: 'transparent' }} src={PondsImgBlack} />
                </CardIcon>
              </Box>
              Current Price
              <Box>
                <span style={{ fontSize: '30px' }}>{pBondPriceInMETIS ? pBondPriceInMETIS : '0.00'} METIS</span>
              </Box>
              <Box>
                <span style={{ fontSize: '16px' }}>${pBondPriceInDollars ? pBondPriceInDollars : '0.00'}</span>
              </Box>
              {/* <span style={{ fontSize: '12px' }}>
                Market Cap: ${(pBondCirculatingSupply * pBondPriceInDollars).toFixed(2)} <br />
                Circulating Supply: {pBondCirculatingSupply} <br />
                Total Supply: {pBondTotalSupply}
              </span> */}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} style={{marginTop: '3%'}}>
          <Card className={classes.transparentGradientBoxes}>
            <CardContent align="center">
              <h2>Explaining The Terminologies</h2>
            </CardContent>
          </Card>
        </Grid>
        {/* Wallet */}
        <Grid item xs={12} sm={8} style={{marginTop: '3%'}}>
          <Card style={{ height: '100%' }} className={classes.transparentGradientBoxes}>
            <CardContent align="left">
              {/* <h2 style={{ marginBottom: '20px' }}>Wallet Balance</h2> */}
              <p><b>The Base Camp</b> — All great adventures require preparation. At the base camp, we supply the initial liquidity to fuel our journey onwards towards the Summit! Stake your $METIS to earn $PEAK.</p>
              <br></br>
              <p><b>The Summit</b> — After much preparation, and having supplied liquidity, we have made it to the Summit! But it takes traversing like a $PRO to reach the $PEAK. Ensure you have made the necessary preparations at The Base Camp, before venturing into the unknown.</p>
              <br></br>
              <p><b>The Pond</b> — When the protocol drops below peg, which it definitely will, it's important to have a place to patiently wait, relax, and unwind. The Pond is where we purchase bonds and patiently wait until the peg is back 1:1. Once back above, you are clear of mind and worry, you can proceed to the Base Camp to recommence preparations for the next journey toward The Summit.</p>
            </CardContent>
          </Card>
        </Grid>

        {/* <Grid item xs={12} sm={6}>
          <Card>
            <CardContent align="center">
              <h2>PEAK-METIS NetSwap LP</h2>
              <Box mt={2}>
                <CardIcon>
                  <TokenSymbol symbol="PEAK-METIS-LP" />
                </CardIcon>
              </Box>
              <Box mt={2}>
                <Button color="primary" disabled={true} onClick={onPresentPeakZap} variant="contained">
                  Zap In
                </Button>
              </Box>
              <Box mt={2}>
                <span style={{ fontSize: '26px' }}>
                  {peakLPStats?.tokenAmount ? peakLPStats?.tokenAmount : '-.--'} PEAK /{' '}
                  {peakLPStats?.metisAmount ? peakLPStats?.metisAmount : '-.--'} METIS
                </span>
              </Box>
              <Box>${peakLPStats?.priceOfOne ? peakLPStats.priceOfOne : '-.--'}</Box>
              <span style={{ fontSize: '12px' }}>
                Liquidity: ${peakLPStats?.totalLiquidity ? peakLPStats.totalLiquidity : '-.--'} <br />
                Total supply: {peakLPStats?.totalSupply ? peakLPStats.totalSupply : '-.--'}
              </span>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent align="center">
              <h2>PRO-METIS NetSwap LP</h2>
              <Box mt={2}>
                <CardIcon>
                  <TokenSymbol symbol="PRO-METIS-LP" />
                </CardIcon>
              </Box>
              <Box mt={2}>
                <Button color="primary" onClick={onPresentPshareZap} variant="contained">
                  Zap In
                </Button>
              </Box>
              <Box mt={2}>
                <span style={{ fontSize: '26px' }}>
                  {pshareLPStats?.tokenAmount ? pshareLPStats?.tokenAmount : '-.--'} PSHARE /{' '}
                  {pshareLPStats?.metisAmount ? pshareLPStats?.metisAmount : '-.--'} METIS
                </span>
              </Box>
              <Box>${pshareLPStats?.priceOfOne ? pshareLPStats.priceOfOne : '-.--'}</Box>
              <span style={{ fontSize: '12px' }}>
                Liquidity: ${pshareLPStats?.totalLiquidity ? pshareLPStats.totalLiquidity : '-.--'}
                <br />
                Total supply: {pshareLPStats?.totalSupply ? pshareLPStats.totalSupply : '-.--'}
              </span>
            </CardContent>
          </Card>
        </Grid> */}
      </Grid>
    </Page>
  );
};

export default Home;
