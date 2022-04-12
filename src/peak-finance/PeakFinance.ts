import { ChainId, Fetcher, Route, Token } from '@netswap/sdk';
import { Fetcher as FetcherSpirit, Token as TokenSpirit } from '@spiritswap/sdk';
import { Configuration } from './config';
import { ContractName, TokenStat, AllocationTime, LPStat, Bank, PoolStats, PShareSwapperStat } from './types';
import { BigNumber, Contract, ethers, EventFilter } from 'ethers';
import { decimalToBalance } from './ether-utils';
import { TransactionResponse } from '@ethersproject/providers';
import ERC20 from './ERC20';
import { getFullDisplayBalance, getDisplayBalance } from '../utils/formatBalance';
import { getDefaultProvider } from '../utils/provider';
import IUniswapV2PairABI from './IUniswapV2Pair.abi.json';
import config, { bankDefinitions } from '../config';
import moment from 'moment';
import { parseUnits } from 'ethers/lib/utils';
import { METIS_TICKER, NETSWAP_ROUTER_ADDR, PEAK_TICKER } from '../utils/constants';
import { ControlPointSharp } from '@material-ui/icons';
/**
 * An API module of Peak Finance contracts.
 * All contract-interacting domain logic should be defined in here.
 */
export class PeakFinance {
  myAccount: string;
  provider: ethers.providers.Web3Provider;
  signer?: ethers.Signer;
  config: Configuration;
  contracts: { [name: string]: Contract };
  externalTokens: { [name: string]: ERC20 };
  masonryVersionOfUser?: string;

  PEAKWMETIS_LP: Contract;
  PEAK: ERC20;
  PSHARE: ERC20;
  PBOND: ERC20;
  METIS: ERC20;

  constructor(cfg: Configuration) {
    const { deployments, externalTokens } = cfg;
    const provider = getDefaultProvider();

    // loads contracts from deployments
    this.contracts = {};
    for (const [name, deployment] of Object.entries(deployments)) {
      this.contracts[name] = new Contract(deployment.address, deployment.abi, provider);
    }
    this.externalTokens = {};
    for (const [symbol, [address, decimal]] of Object.entries(externalTokens)) {
      this.externalTokens[symbol] = new ERC20(address, provider, symbol, decimal);
    }
    this.PEAK = new ERC20(deployments.peak.address, provider, 'PEAK');
    this.PSHARE = new ERC20(deployments.pShare.address, provider, 'PRO');
    this.PBOND = new ERC20(deployments.pBond.address, provider, 'POND');
    this.METIS = this.externalTokens['WMETIS'];

    // Uniswap V2 Pair
    this.PEAKWMETIS_LP = new Contract(externalTokens['PEAK-METIS-LP'][0], IUniswapV2PairABI, provider);
    this.config = cfg;
    this.provider = provider;
  }

  /**
   * @param provider From an unlocked wallet. (e.g. Metamask)
   * @param account An address of unlocked wallet account.
   */
  unlockWallet(provider: any, account: string) {
    const newProvider = new ethers.providers.Web3Provider(provider, this.config.chainId);
    this.signer = newProvider.getSigner(0);
    this.myAccount = account;
    for (const [name, contract] of Object.entries(this.contracts)) {
      this.contracts[name] = contract.connect(this.signer);
    }
    const tokens = [this.PEAK, this.PSHARE, this.PBOND, ...Object.values(this.externalTokens)];
    for (const token of tokens) {
      token.connect(this.signer);
    }
    this.PEAKWMETIS_LP = this.PEAKWMETIS_LP.connect(this.signer);
    console.log(`🔓 Wallet is unlocked. Welcome, ${account}!`);
    this.fetchMasonryVersionOfUser()
      .then((version) => (this.masonryVersionOfUser = version))
      .catch((err) => {
        console.error(`Failed to fetch masonry version: ${err.stack}`);
        this.masonryVersionOfUser = 'latest';
      });
  }

  get isUnlocked(): boolean {
    return !!this.myAccount;
  }

  //===================================================================
  //===================== GET ASSET STATS =============================
  //===================FROM NETSWAP TO DISPLAY =========================
  //=========================IN HOME PAGE==============================
  //===================================================================

  async getPeakStat(): Promise<TokenStat> {
    const { PeakMetisRewardPool, PeakMetisLPPeakRewardPool } = this.contracts;
    const supply = await this.PEAK.totalSupply();
    const peakRewardPoolSupply = await this.PEAK.balanceOf(PeakMetisRewardPool.address);
    const peakRewardPoolSupply2 = await this.PEAK.balanceOf(PeakMetisLPPeakRewardPool.address);
    const peakCirculatingSupply = supply
      .sub(peakRewardPoolSupply)
      .sub(peakRewardPoolSupply2);
    const priceInMETIS = await this.getTokenPriceFromPancakeswap(this.PEAK);
    const priceOfOneMETIS = await this.getWMETISPriceFromPancakeswap();
    const priceOfPeakInDollars = (Number(priceInMETIS) * Number(priceOfOneMETIS)).toFixed(2);

    return {
      tokenInMetis: priceInMETIS,
      priceInDollars: priceOfPeakInDollars,
      // tokenInMetis: "1.0025",
      // priceInDollars: "1.03",
      totalSupply: getDisplayBalance(supply, this.PEAK.decimal, 0),
      circulatingSupply: getDisplayBalance(peakCirculatingSupply, this.PEAK.decimal, 0),
    };
  }

  /**
   * Calculates various stats for the requested LP
   * @param name of the LP token to load stats for
   * @returns
   */
  async getLPStat(name: string): Promise<LPStat> {
    const lpToken = this.externalTokens[name];
    const lpTokenSupplyBN = await lpToken.totalSupply();
    const lpTokenSupply = getDisplayBalance(lpTokenSupplyBN, 18);
    const token0 = name.startsWith('PEAK') ? this.PEAK : this.PSHARE;
    const isPeak = name.startsWith('PEAK');
    const tokenAmountBN = await token0.balanceOf(lpToken.address);
    const tokenAmount = getDisplayBalance(tokenAmountBN, 18);

    const metisAmountBN = await this.METIS.balanceOf(lpToken.address);
    const metisAmount = getDisplayBalance(metisAmountBN, 18);
    const tokenAmountInOneLP = Number(tokenAmount) / Number(lpTokenSupply);
    const metisAmountInOneLP = Number(metisAmount) / Number(lpTokenSupply);
    const lpTokenPrice = await this.getLPTokenPrice(lpToken, token0, isPeak);
    const lpTokenPriceFixed = Number(lpTokenPrice).toFixed(2).toString();
    const liquidity = (Number(lpTokenSupply) * Number(lpTokenPrice)).toFixed(2).toString();
    return {
      tokenAmount: tokenAmountInOneLP.toFixed(2).toString(),
      metisAmount: metisAmountInOneLP.toFixed(2).toString(),
      priceOfOne: lpTokenPriceFixed,
      totalLiquidity: liquidity,
      totalSupply: Number(lpTokenSupply).toFixed(2).toString(),
    };
  }

  /**
   * Use this method to get price for Peak
   * @returns TokenStat for PBOND
   * priceInMETIS
   * priceInDollars
   * TotalSupply
   * CirculatingSupply (always equal to total supply for bonds)
   */
  async gepBondStat(): Promise<TokenStat> {
    const { Treasury } = this.contracts;
    const peakStat = await this.getPeakStat();
    const bondPeakRatioBN = await Treasury.getBondPremiumRate();
    const modifier = bondPeakRatioBN / 1e18 > 1 ? bondPeakRatioBN / 1e18 : 1;
    const bondPriceInMETIS = (Number(peakStat.tokenInMetis) * modifier).toFixed(2);
    const priceOfPBondInDollars = (Number(peakStat.priceInDollars) * modifier).toFixed(2);
    const supply = await this.PBOND.displayedTotalSupply();
    console.log(supply);
    return {
      tokenInMetis: bondPriceInMETIS,
      priceInDollars: priceOfPBondInDollars,
      totalSupply: supply,
      circulatingSupply: supply,
    };
  }

  /**
   * @returns TokenStat for PSHARE
   * priceInMETIS
   * priceInDollars
   * TotalSupply
   * CirculatingSupply (always equal to total supply for bonds)
   */
  async gepShareStat(): Promise<TokenStat> {
    const { PeakMetisLPPShareRewardPool } = this.contracts;

    const supply = await this.PSHARE.totalSupply();
    const priceInMETIS = await this.getTokenPriceFromPancakeswap(this.PSHARE);
    const peakRewardPoolSupply = await this.PSHARE.balanceOf(PeakMetisLPPShareRewardPool.address);
    const pShareCirculatingSupply = supply.sub(peakRewardPoolSupply);
    const priceOfOneMETIS = await this.getWMETISPriceFromPancakeswap();
    const priceOfSharesInDollars = (Number(priceInMETIS) * Number(priceOfOneMETIS)).toFixed(2);

    return {
      tokenInMetis: priceInMETIS,
      priceInDollars: priceOfSharesInDollars,
      totalSupply: getDisplayBalance(supply, this.PSHARE.decimal, 0),
      circulatingSupply: getDisplayBalance(pShareCirculatingSupply, this.PSHARE.decimal, 0),
    };
  }

  async getPeakStatInEstimatedTWAP(): Promise<TokenStat> {
    const { SeigniorageOracle, PeakMetisRewardPool } = this.contracts;
    const expectedPrice = await SeigniorageOracle.twap(this.PEAK.address, ethers.utils.parseEther('1'));

    const supply = await this.PEAK.totalSupply();
    const peakRewardPoolSupply = await this.PEAK.balanceOf(PeakMetisRewardPool.address);
    const peakCirculatingSupply = supply.sub(peakRewardPoolSupply);
    return {
      tokenInMetis: getDisplayBalance(expectedPrice),
      priceInDollars: getDisplayBalance(expectedPrice),
      totalSupply: getDisplayBalance(supply, this.PEAK.decimal, 0),
      circulatingSupply: getDisplayBalance(peakCirculatingSupply, this.PEAK.decimal, 0),
    };
  }

  async getPeakPriceInLastTWAP(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.getPeakUpdatedPrice();
  }

  async gepBondsPurchasable(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.getBurnablePeakLeft();
  }

  /**
   * Calculates the TVL, APR and daily APR of a provided pool/bank
   * @param bank
   * @returns
   */
  async getPoolAPRs(bank: Bank): Promise<PoolStats> {
    if (this.myAccount === undefined) return;
    const depositToken = bank.depositToken;
    const poolContract = this.contracts[bank.contract];
    const depositTokenPrice = await this.getDepositTokenPriceInDollars(bank.depositTokenName, depositToken);
    const stakeInPool = await depositToken.balanceOf(bank.address);
    const TVL = Number(depositTokenPrice) * Number(getDisplayBalance(stakeInPool, depositToken.decimal));
    const stat = bank.earnTokenName === 'PEAK' ? await this.getPeakStat() : await this.gepShareStat();
    const tokenPerSecond = await this.getTokenPerSecond(
      bank.earnTokenName,
      bank.contract,
      poolContract,
      bank.depositTokenName,
    );

    const tokenPerHour = tokenPerSecond.mul(60).mul(60);
    const totalRewardPricePerYear =
      Number(stat.priceInDollars) * Number(getDisplayBalance(tokenPerHour.mul(24).mul(365)));
    const totalRewardPricePerDay = Number(stat.priceInDollars) * Number(getDisplayBalance(tokenPerHour.mul(24)));
    const totalStakingTokenInPool =
      Number(depositTokenPrice) * Number(getDisplayBalance(stakeInPool, depositToken.decimal));
    const dailyAPR = (totalRewardPricePerDay / totalStakingTokenInPool) * 100;
    const yearlyAPR = (totalRewardPricePerYear / totalStakingTokenInPool) * 100;
    return {
      dailyAPR: dailyAPR.toFixed(2).toString(),
      yearlyAPR: yearlyAPR.toFixed(2).toString(),
      TVL: TVL.toFixed(2).toString(),
    };
  }

  /**
   * Method to return the amount of tokens the pool yields per second
   * @param earnTokenName the name of the token that the pool is earning
   * @param contractName the contract of the pool/bank
   * @param poolContract the actual contract of the pool
   * @returns
   */
  async getTokenPerSecond(
    earnTokenName: string,
    contractName: string,
    poolContract: Contract,
    depositTokenName: string,
  ) {
    if (earnTokenName === 'PEAK') {
      if (!contractName.endsWith('PeakRewardPool')) {
        const rewardPerSecond = await poolContract.peakPerSecond();
        return rewardPerSecond;
      }
      const poolStartTime = await poolContract.poolStartTime();
      const startDateTime = new Date(poolStartTime.toNumber() * 1000);
      const FOUR_DAYS = 4 * 24 * 60 * 60 * 1000;
      if (Date.now() - startDateTime.getTime() > FOUR_DAYS) {
        return await poolContract.epochPeakPerSecond(1);
      }
      return await poolContract.epochPeakPerSecond(0);
    }
    const rewardPerSecond = await poolContract.pSharePerSecond();
    if (depositTokenName.startsWith('PEAK')) {
      return rewardPerSecond.mul(35500).div(59500);
    } else {
      return rewardPerSecond.mul(24000).div(59500);
    }
  }

  /**
   * Method to calculate the tokenPrice of the deposited asset in a pool/bank
   * If the deposited token is an LP it will find the price of its pieces
   * @param tokenName
   * @param pool
   * @param token
   * @returns
   */
  async getDepositTokenPriceInDollars(tokenName: string, token: ERC20) {
    let tokenPrice;
    const priceOfOneMetisInDollars = await this.getWMETISPriceFromPancakeswap();
    if (tokenName === 'WMETIS') {
      tokenPrice = priceOfOneMetisInDollars;
    } else {
      if (tokenName === 'PEAK-METIS-LP') {
        tokenPrice = await this.getLPTokenPrice(token, this.PEAK, true);
      } else if (tokenName === 'PRO-METIS-LP') {
        tokenPrice = await this.getLPTokenPrice(token, this.PSHARE, false);
      }  else {
        tokenPrice = await this.getTokenPriceFromPancakeswap(token);
        tokenPrice = (Number(tokenPrice) * Number(priceOfOneMetisInDollars)).toString();
      }
    }
    return tokenPrice;
  }

  //===================================================================
  //===================== GET ASSET STATS =============================
  //=========================== END ===================================
  //===================================================================

  async getCurrentEpoch(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.epoch();
  }

  async gepBondOraclePriceInLastTWAP(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.getBondPremiumRate();
  }

  /**
   * Buy bonds with cash.
   * @param amount amount of cash to purchase bonds with.
   */
  async buyBonds(amount: string | number): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    const treasuryPeakPrice = await Treasury.getPeakPrice();
    return await Treasury.buyBonds(decimalToBalance(amount), treasuryPeakPrice);
  }

  /**
   * Redeem bonds for cash.
   * @param amount amount of bonds to redeem.
   */
  async redeemBonds(amount: string): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    const priceForPeak = await Treasury.getPeakPrice();
    return await Treasury.redeemBonds(decimalToBalance(amount), priceForPeak);
  }

  async getTotalValueLocked(): Promise<Number> {
    let totalValue = 0;
    for (const bankInfo of Object.values(bankDefinitions)) {
      const pool = this.contracts[bankInfo.contract];
      const token = this.externalTokens[bankInfo.depositTokenName];
      const tokenPrice = await this.getDepositTokenPriceInDollars(bankInfo.depositTokenName, token);
      const tokenAmountInPool = await token.balanceOf(pool.address);
      const value = Number(getDisplayBalance(tokenAmountInPool, token.decimal)) * Number(tokenPrice);
      const poolValue = Number.isNaN(value) ? 0 : value;
      totalValue += poolValue;
    }

    const PSHAREPrice = (await this.gepShareStat()).priceInDollars;
    const masonrypShareBalanceOf = await this.PSHARE.balanceOf(this.currentMasonry().address);
    const masonryTVL = Number(getDisplayBalance(masonrypShareBalanceOf, this.PSHARE.decimal)) * Number(PSHAREPrice);

    return totalValue;
  }

  /**
   * Calculates the price of an LP token
   * Reference https://github.com/DefiDebauchery/discordpricebot/blob/4da3cdb57016df108ad2d0bb0c91cd8dd5f9d834/pricebot/pricebot.py#L150
   * @param lpToken the token under calculation
   * @param token the token pair used as reference (the other one would be METIS in most cases)
   * @param isPeak sanity check for usage of peak token or pShare
   * @returns price of the LP token
   */
  async getLPTokenPrice(lpToken: ERC20, token: ERC20, isPeak: boolean): Promise<string> {
    const totalSupply = getFullDisplayBalance(await lpToken.totalSupply(), lpToken.decimal);
    //Get amount of tokenA
    const tokenSupply = getFullDisplayBalance(await token.balanceOf(lpToken.address), token.decimal);
    const stat = isPeak === true ? await this.getPeakStat() : await this.gepShareStat();
    const priceOfToken = stat.priceInDollars;
    const tokenInLP = Number(tokenSupply) / Number(totalSupply);
    const tokenPrice = (Number(priceOfToken) * tokenInLP * 2) //We multiply by 2 since half the price of the lp token is the price of each piece of the pair. So twice gives the total
      .toString();
    return tokenPrice;
  }

  async earnedFromBank(
    poolName: ContractName,
    earnTokenName: String,
    poolId: Number,
    account = this.myAccount,
  ): Promise<BigNumber> {
    const pool = this.contracts[poolName];
    try {
      if (earnTokenName === 'PEAK') {
        return await pool.pendingPEAK(poolId, account);
      } else {
        return await pool.pendingShare(poolId, account);
      }
    } catch (err) {
      console.error(`Failed to call earned() on pool ${pool.address}: ${err.stack}`);
      return BigNumber.from(0);
    }
  }

  async stakedBalanceOnBank(poolName: ContractName, poolId: Number, account = this.myAccount): Promise<BigNumber> {
    const pool = this.contracts[poolName];
    try {
      let userInfo = await pool.userInfo(poolId, account);
      return await userInfo.amount;
    } catch (err) {
      console.error(`Failed to call balanceOf() on pool ${pool.address}: ${err.stack}`);
      return BigNumber.from(0);
    }
  }

  /**
   * Deposits token to given pool.
   * @param poolName A name of pool contract.
   * @param amount Number of tokens with decimals applied. (e.g. 1.45 DAI * 10^18)
   * @returns {string} Transaction hash
   */
  async stake(poolName: ContractName, poolId: Number, amount: BigNumber): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    return await pool.deposit(poolId, amount);
  }

  /**
   * Withdraws token from given pool.
   * @param poolName A name of pool contract.
   * @param amount Number of tokens with decimals applied. (e.g. 1.45 DAI * 10^18)
   * @returns {string} Transaction hash
   */
  async unstake(poolName: ContractName, poolId: Number, amount: BigNumber): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    return await pool.withdraw(poolId, amount);
  }

  /**
   * Transfers earned token reward from given pool to my account.
   */
  async harvest(poolName: ContractName, poolId: Number): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    //By passing 0 as the amount, we are asking the contract to only redeem the reward and not the currently staked token
    return await pool.withdraw(poolId, 0);
  }

  /**
   * Harvests and withdraws deposited tokens from the pool.
   */
  async exit(poolName: ContractName, poolId: Number, account = this.myAccount): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    let userInfo = await pool.userInfo(poolId, account);
    return await pool.withdraw(poolId, userInfo.amount);
  }

  async fetchMasonryVersionOfUser(): Promise<string> {
    return 'latest';
  }

  currentMasonry(): Contract {
    if (!this.masonryVersionOfUser) {
      throw new Error('you must unlock the wallet to continue.');
    }
    return this.contracts.Masonry;
  }

  isOldMasonryMember(): boolean {
    return this.masonryVersionOfUser !== 'latest';
  }

  async getTokenPriceFromPancakeswap(tokenContract: ERC20): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    // const { chainId } = this.config;
    const chainId = ChainId.MAINNET;
    const { WMETIS } = this.config.externalTokens;

    const wmetis = new Token(chainId, WMETIS[0], WMETIS[1], "WMETIS");
    const token = new Token(chainId, tokenContract.address, tokenContract.decimal, tokenContract.symbol);
    try {
      const wmetisToToken = await Fetcher.fetchPairData(wmetis, token, this.provider);
      const priceInBUSD = new Route([wmetisToToken], token);
      return priceInBUSD.midPrice.toFixed(4);
    } catch (err) {
      console.error(`Failed to fetch token price of ${tokenContract.symbol}: ${err}`);
    }
  }

  async getTokenPriceFromSpiritswap(tokenContract: ERC20): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    const { chainId } = this.config;

    const { WMETIS } = this.externalTokens;

    const wmetis = new TokenSpirit(chainId, WMETIS.address, WMETIS.decimal);
    const token = new TokenSpirit(chainId, tokenContract.address, tokenContract.decimal, tokenContract.symbol);
    try {
      const wmetisToToken = await FetcherSpirit.fetchPairData(wmetis, token, this.provider);
      const liquidityToken = wmetisToToken.liquidityToken;
      let metisBalanceInLP = await WMETIS.balanceOf(liquidityToken.address);
      let metisAmount = Number(getFullDisplayBalance(metisBalanceInLP, WMETIS.decimal));
      let shibaBalanceInLP = await tokenContract.balanceOf(liquidityToken.address);
      let shibaAmount = Number(getFullDisplayBalance(shibaBalanceInLP, tokenContract.decimal));
      const priceOfOneMetisInDollars = await this.getWMETISPriceFromPancakeswap();
      let priceOfShiba = (metisAmount / shibaAmount) * Number(priceOfOneMetisInDollars);
      return priceOfShiba.toString();
    } catch (err) {
      console.error(`Failed to fetch token price of ${tokenContract.symbol}: ${err}`);
    }
  }

  async getWMETISPriceFromPancakeswap(): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    const { WMETIS, USDT } = this.externalTokens;
    try {
      const usdt_wmetis_lp_pair = this.externalTokens['USDT-METIS-LP'];
      let metis_amount_BN = await WMETIS.balanceOf(usdt_wmetis_lp_pair.address);
      let metis_amount = Number(getFullDisplayBalance(metis_amount_BN, WMETIS.decimal));
      let usdt_amount_BN = await USDT.balanceOf(usdt_wmetis_lp_pair.address);
      let usdt_amount = Number(getFullDisplayBalance(usdt_amount_BN, USDT.decimal));
      return (usdt_amount / metis_amount).toString();
    } catch (err) {
      console.error(`Failed to fetch token price of WMETIS: ${err}`);
    }
  }

  //===================================================================
  //===================================================================
  //===================== MASONRY METHODS =============================
  //===================================================================
  //===================================================================

  async getMasonryAPR() {
    const Masonry = this.currentMasonry();
    const latestSnapshotIndex = await Masonry.latestSnapshotIndex();
    const lastHistory = await Masonry.masonryHistory(latestSnapshotIndex);

    const lastRewardsReceived = lastHistory[1];

    const PSHAREPrice = (await this.gepShareStat()).priceInDollars;
    const PEAKPrice = (await this.getPeakStat()).priceInDollars;
    const epochRewardsPerShare = lastRewardsReceived / 1e18;

    //Mgod formula
    const amountOfRewardsPerDay = epochRewardsPerShare * Number(PEAKPrice) * 4;
    const masonrypShareBalanceOf = await this.PSHARE.balanceOf(Masonry.address);
    const masonryTVL = Number(getDisplayBalance(masonrypShareBalanceOf, this.PSHARE.decimal)) * Number(PSHAREPrice);
    const realAPR = ((amountOfRewardsPerDay * 100) / masonryTVL) * 365;
    return realAPR;
  }

  /**
   * Checks if the user is allowed to retrieve their reward from the Masonry
   * @returns true if user can withdraw reward, false if they can't
   */
  async canUserClaimRewardFromMasonry(): Promise<boolean> {
    const Masonry = this.currentMasonry();
    return await Masonry.canClaimReward(this.myAccount);
  }

  /**
   * Checks if the user is allowed to retrieve their reward from the Masonry
   * @returns true if user can withdraw reward, false if they can't
   */
  async canUserUnstakeFromMasonry(): Promise<boolean> {
    const Masonry = this.currentMasonry();
    const canWithdraw = await Masonry.canWithdraw(this.myAccount);
    const stakedAmount = await this.getStakedSharesOnMasonry();
    const notStaked = Number(getDisplayBalance(stakedAmount, this.PSHARE.decimal)) === 0;
    const result = notStaked ? true : canWithdraw;
    return result;
  }

  async timeUntilClaimRewardFromMasonry(): Promise<BigNumber> {
    // const Masonry = this.currentMasonry();
    // const mason = await Masonry.masons(this.myAccount);
    return BigNumber.from(0);
  }

  async getTotalStakedInMasonry(): Promise<BigNumber> {
    const Masonry = this.currentMasonry();
    return await Masonry.totalSupply();
  }

  async stakeShareToMasonry(amount: string): Promise<TransactionResponse> {
    if (this.isOldMasonryMember()) {
      throw new Error("you're using old masonry. please withdraw and deposit the PSHARE again.");
    }
    const Masonry = this.currentMasonry();
    return await Masonry.stake(decimalToBalance(amount));
  }

  async getStakedSharesOnMasonry(): Promise<BigNumber> {
    const Masonry = this.currentMasonry();
    if (this.masonryVersionOfUser === 'v1') {
      return await Masonry.gepShareOf(this.myAccount);
    }
    return await Masonry.balanceOf(this.myAccount);
  }

  async getEarningsOnMasonry(): Promise<BigNumber> {
    const Masonry = this.currentMasonry();
    if (this.masonryVersionOfUser === 'v1') {
      return await Masonry.getCashEarningsOf(this.myAccount);
    }
    return await Masonry.earned(this.myAccount);
  }

  async withdrawShareFromMasonry(amount: string): Promise<TransactionResponse> {
    const Masonry = this.currentMasonry();
    return await Masonry.withdraw(decimalToBalance(amount));
  }

  async harvestCashFromMasonry(): Promise<TransactionResponse> {
    const Masonry = this.currentMasonry();
    if (this.masonryVersionOfUser === 'v1') {
      return await Masonry.claimDividends();
    }
    return await Masonry.claimReward();
  }

  async exitFromMasonry(): Promise<TransactionResponse> {
    const Masonry = this.currentMasonry();
    return await Masonry.exit();
  }

  async getTreasuryNextAllocationTime(): Promise<AllocationTime> {
    const { Treasury } = this.contracts;
    const nextEpochTimestamp: BigNumber = await Treasury.nextEpochPoint();
    const nextAllocation = new Date(nextEpochTimestamp.mul(1000).toNumber());
    const prevAllocation = new Date(Date.now());

    return { from: prevAllocation, to: nextAllocation };
  }
  /**
   * This method calculates and returns in a from to to format
   * the period the user needs to wait before being allowed to claim
   * their reward from the masonry
   * @returns Promise<AllocationTime>
   */
  async getUserClaimRewardTime(): Promise<AllocationTime> {
    const { Masonry, Treasury } = this.contracts;
    const nextEpochTimestamp = await Masonry.nextEpochPoint(); //in unix timestamp
    const currentEpoch = await Masonry.epoch();
    const mason = await Masonry.masons(this.myAccount);
    const startTimeEpoch = mason.epochTimerStart;
    const period = await Treasury.PERIOD();
    const periodInHours = period / 60 / 60; // 6 hours, period is displayed in seconds which is 21600
    const rewardLockupEpochs = await Masonry.rewardLockupEpochs();
    const targetEpochForClaimUnlock = Number(startTimeEpoch) + Number(rewardLockupEpochs);

    const fromDate = new Date(Date.now());
    if (targetEpochForClaimUnlock - currentEpoch <= 0) {
      return { from: fromDate, to: fromDate };
    } else if (targetEpochForClaimUnlock - currentEpoch === 1) {
      const toDate = new Date(nextEpochTimestamp * 1000);
      return { from: fromDate, to: toDate };
    } else {
      const toDate = new Date(nextEpochTimestamp * 1000);
      const delta = targetEpochForClaimUnlock - currentEpoch - 1;
      const endDate = moment(toDate)
        .add(delta * periodInHours, 'hours')
        .toDate();
      return { from: fromDate, to: endDate };
    }
  }

  /**
   * This method calculates and returns in a from to to format
   * the period the user needs to wait before being allowed to unstake
   * from the masonry
   * @returns Promise<AllocationTime>
   */
  async getUserUnstakeTime(): Promise<AllocationTime> {
    const { Masonry, Treasury } = this.contracts;
    const nextEpochTimestamp = await Masonry.nextEpochPoint();
    const currentEpoch = await Masonry.epoch();
    const mason = await Masonry.masons(this.myAccount);
    const startTimeEpoch = mason.epochTimerStart;
    const period = await Treasury.PERIOD();
    const PeriodInHours = period / 60 / 60;
    const withdrawLockupEpochs = await Masonry.withdrawLockupEpochs();
    const fromDate = new Date(Date.now());
    const targetEpochForClaimUnlock = Number(startTimeEpoch) + Number(withdrawLockupEpochs);
    const stakedAmount = await this.getStakedSharesOnMasonry();
    if (currentEpoch <= targetEpochForClaimUnlock && Number(stakedAmount) === 0) {
      return { from: fromDate, to: fromDate };
    } else if (targetEpochForClaimUnlock - currentEpoch === 1) {
      const toDate = new Date(nextEpochTimestamp * 1000);
      return { from: fromDate, to: toDate };
    } else {
      const toDate = new Date(nextEpochTimestamp * 1000);
      const delta = targetEpochForClaimUnlock - Number(currentEpoch) - 1;
      const endDate = moment(toDate)
        .add(delta * PeriodInHours, 'hours')
        .toDate();
      return { from: fromDate, to: endDate };
    }
  }

  async watchAssetInMetamask(assetName: string): Promise<boolean> {
    const { ethereum } = window as any;
    if (ethereum && ethereum.networkVersion === config.chainId.toString()) {
      let asset;
      let assetUrl;
      if (assetName === 'PEAK') {
        asset = this.PEAK;
        assetUrl = 'https://peak.finance/presskit/peak_icon_noBG.png';
      } else if (assetName === 'PRO') {
        asset = this.PSHARE;
        assetUrl = 'https://peak.finance/presskit/pshare_icon_noBG.png';
      } else if (assetName === 'POND') {
        asset = this.PBOND;
        assetUrl = 'https://peak.finance/presskit/pbond_icon_noBG.png';
      }
      await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: asset.address,
            symbol: asset.symbol,
            decimals: 18,
            image: assetUrl,
          },
        },
      });
    }
    return true;
  }

  async providePeakMetisLP(metisAmount: string, peakAmount: BigNumber): Promise<TransactionResponse> {
    const { TaxOffice } = this.contracts;
    let overrides = {
      value: parseUnits(metisAmount, 18),
    };
    return await TaxOffice.addLiquidityMetisTaxFree(peakAmount, peakAmount.mul(992).div(1000), parseUnits(metisAmount, 18).mul(800).div(1000), overrides);
  }

  async quoteFromNetSwap(tokenAmount: string, tokenName: string): Promise<string> {
    const { UniswapV2Router } = this.contracts;
    const { _reserve0, _reserve1 } = await this.PEAKWMETIS_LP.getReserves();
    let quote;
    if (tokenName === 'PEAK') {
      quote = await UniswapV2Router.quote(parseUnits(tokenAmount), _reserve1, _reserve0);
    } else {
      quote = await UniswapV2Router.quote(parseUnits(tokenAmount), _reserve0, _reserve1);
    }
    return (quote / 1e18).toString();
  }

  /**
   * @returns an array of the regulation events till the most up to date epoch
   */
  async listenForRegulationsEvents(): Promise<any> {
    const { Treasury } = this.contracts;

    const treasuryDaoFundedFilter = Treasury.filters.DaoFundFunded();
    const treasuryDevFundedFilter = Treasury.filters.DevFundFunded();
    const treasuryMasonryFundedFilter = Treasury.filters.MasonryFunded();
    const boughpBondsFilter = Treasury.filters.BoughpBonds();
    const redeemBondsFilter = Treasury.filters.RedeemedBonds();

    let epochBlocksRanges: any[] = [];
    let masonryFundEvents = await Treasury.queryFilter(treasuryMasonryFundedFilter);
    var events: any[] = [];
    masonryFundEvents.forEach(function callback(value, index) {
      events.push({ epoch: index + 1 });
      events[index].masonryFund = getDisplayBalance(value.args[1]);
      if (index === 0) {
        epochBlocksRanges.push({
          index: index,
          startBlock: value.blockNumber,
          boughBonds: 0,
          redeemedBonds: 0,
        });
      }
      if (index > 0) {
        epochBlocksRanges.push({
          index: index,
          startBlock: value.blockNumber,
          boughBonds: 0,
          redeemedBonds: 0,
        });
        epochBlocksRanges[index - 1].endBlock = value.blockNumber;
      }
    });

    epochBlocksRanges.forEach(async (value, index) => {
      events[index].bondsBought = await this.gepBondsWithFilterForPeriod(
        boughpBondsFilter,
        value.startBlock,
        value.endBlock,
      );
      events[index].bondsRedeemed = await this.gepBondsWithFilterForPeriod(
        redeemBondsFilter,
        value.startBlock,
        value.endBlock,
      );
    });
    let DEVFundEvents = await Treasury.queryFilter(treasuryDevFundedFilter);
    DEVFundEvents.forEach(function callback(value, index) {
      events[index].devFund = getDisplayBalance(value.args[1]);
    });
    let DAOFundEvents = await Treasury.queryFilter(treasuryDaoFundedFilter);
    DAOFundEvents.forEach(function callback(value, index) {
      events[index].daoFund = getDisplayBalance(value.args[1]);
    });
    return events;
  }

  /**
   * Helper method
   * @param filter applied on the query to the treasury events
   * @param from block number
   * @param to block number
   * @returns the amount of bonds events emitted based on the filter provided during a specific period
   */
  async gepBondsWithFilterForPeriod(filter: EventFilter, from: number, to: number): Promise<number> {
    const { Treasury } = this.contracts;
    const bondsAmount = await Treasury.queryFilter(filter, from, to);
    return bondsAmount.length;
  }

  async estimateZapIn(tokenName: string, lpName: string, amount: string): Promise<number[]> {
    const { zapper } = this.contracts;
    const lpToken = this.externalTokens[lpName];
    let estimate;
    if (tokenName === METIS_TICKER) {
      estimate = await zapper.estimateZapIn(lpToken.address, NETSWAP_ROUTER_ADDR, parseUnits(amount, 18));
    } else {
      const token = tokenName === PEAK_TICKER ? this.PEAK : this.PSHARE;
      estimate = await zapper.estimateZapInToken(
        token.address,
        lpToken.address,
        NETSWAP_ROUTER_ADDR,
        parseUnits(amount, 18),
      );
    }
    return [estimate[0] / 1e18, estimate[1] / 1e18];
  }
  async zapIn(tokenName: string, lpName: string, amount: string): Promise<TransactionResponse> {
    const { zapper } = this.contracts;
    const lpToken = this.externalTokens[lpName];
    if (tokenName === METIS_TICKER) {
      let overrides = {
        value: parseUnits(amount, 18),
      };
      return await zapper.zapIn(lpToken.address, NETSWAP_ROUTER_ADDR, this.myAccount, overrides);
    } else {
      const token = tokenName === PEAK_TICKER ? this.PEAK : this.PSHARE;
      return await zapper.zapInToken(
        token.address,
        parseUnits(amount, 18),
        lpToken.address,
        NETSWAP_ROUTER_ADDR,
        this.myAccount,
      );
    }
  }
  async swapPBondToPShare(pbondAmount: BigNumber): Promise<TransactionResponse> {
    const { PShareSwapper } = this.contracts;
    return await PShareSwapper.swapPBondToPShare(pbondAmount);
  }
  async estimateAmountOfPShare(pbondAmount: string): Promise<string> {
    const { PShareSwapper } = this.contracts;
    try {
      const estimateBN = await PShareSwapper.estimateAmountOfPShare(parseUnits(pbondAmount, 18));
      return getDisplayBalance(estimateBN, 18, 6);
    } catch (err) {
      console.error(`Failed to fetch estimate pshare amount: ${err}`);
    }
  }

  async getPShareSwapperStat(address: string): Promise<PShareSwapperStat> {
    const { PShareSwapper } = this.contracts;
    const pshareBalanceBN = await PShareSwapper.getPShareBalance();
    const pbondBalanceBN = await PShareSwapper.getPBondBalance(address);
    // const peakPriceBN = await PShareSwapper.getPeakPrice();
    // const psharePriceBN = await PShareSwapper.getPSharePrice();
    const ratePSharePerPeakBN = await PShareSwapper.getPShareAmountPerPeak();
    const pshareBalance = getDisplayBalance(pshareBalanceBN, 18, 5);
    const pbondBalance = getDisplayBalance(pbondBalanceBN, 18, 5);
    return {
      pshareBalance: pshareBalance.toString(),
      pbondBalance: pbondBalance.toString(),
      // peakPrice: peakPriceBN.toString(),
      // psharePrice: psharePriceBN.toString(),
      ratePSharePerPeak: ratePSharePerPeakBN.toString(),
    };
  }
}
