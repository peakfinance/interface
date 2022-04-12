import React from 'react';

//Graveyard ecosystem logos
import peakLogo from '../../assets/img/peak_fin_black.png';
import pShareLogo from '../../assets/img/pro.png';
import peakLogoPNG from '../../assets/img/crypto_peak_cash.f2b44ef4.png';
import pShareLogoPNG from '../../assets/img/crypto_peak_share.bf1a6c52.png';
import pBondLogo from '../../assets/img/ponds.png';

import peakMetisLpLogo from '../../assets/img/peak_metis_lp.png';
import pshareMetisLpLogo from '../../assets/img/pshare_metis_lp.png';

import wmetisLogo from '../../assets/img/metisLogo.png';
import booLogo from '../../assets/img/netswap.png';
import zooLogo from '../../assets/img/zoo_logo.svg';
import shibaLogo from '../../assets/img/shiba_logo.svg';

const logosBySymbol: { [title: string]: string } = {
  //Real tokens
  //=====================
  PEAK: peakLogo,
  PEAKPNG: peakLogo,
  PSHAREPNG: peakLogo,
  PSHARE: pShareLogo,
  PRO: pShareLogo,
  POND: pBondLogo,
  PBOND: pBondLogo,
  WMETIS: wmetisLogo,
  METIS: wmetisLogo,
  'PEAK-METIS-LP': peakLogo,
  'PRO-METIS-LP': pShareLogo,
};

type LogoProps = {
  symbol: string;
  size?: number;
};

const TokenSymbol: React.FC<LogoProps> = ({ symbol, size = 64 }) => {
  if (!logosBySymbol[symbol]) {
    throw new Error(`Invalid Token Logo symbol: ${symbol}`);
  }
  return <img src={logosBySymbol[symbol]} alt={`${symbol} Logo`} width={size} height={size} />;
};

export default TokenSymbol;
