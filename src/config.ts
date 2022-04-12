// import { ChainId } from '@pancakeswap-libs/sdk';
import { ChainId } from '@spiritswap/sdk';
import { Configuration } from './peak-finance/config';
import { BankInfo } from './peak-finance';

const configurations: { [env: string]: Configuration } = {
  dev: {
    chainId: 3,
    networkName: 'Ropsten Test Network',
    metisscanUrl: 'https://ropsten.etherscan.io',
    defaultProvider: 'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    deployments: require('./peak-finance/deployments/deployments.testing.json'),
    externalTokens: {
      METIS: ['0xc778417e063141139fce010982780140aa0cd5ab', 18],
      USDC: ['0x9c8FA1ee532f8Afe9F2E27f06FD836F3C9572f71', 6],
      'USDT-METIS-LP': ['0x69Ce10FAc9639b8fdd2c8250b35E06f31a453EEB', 18],
      'PEAK-METIS-LP': ['0xeeda5c7aa5d1cdc9be8290eeb702e4306f7add72', 18],
      'PRO-METIS-LP': ['0x0d5f23b096d1f280088e31d02c1d07da604d4e9c', 18],
    },
    baseLaunchDate: new Date('2021-06-02 13:00:00Z'),
    bondLaunchesAt: new Date('2020-12-03T15:00:00Z'),
    masonryLaunchesAt: new Date('2020-12-11T00:00:00Z'),
    refreshInterval: 10000,
  },

  prod: {
    chainId: 1088,
    networkName: 'Metis Andromeda Mainnet',
    metisscanUrl: 'https://andromeda-explorer.metis.io/',
    defaultProvider: 'https://andromeda.metis.io/?owner=1088/',
    deployments: require('./peak-finance/deployments/deployments.mainnet.json'),
    externalTokens: {
      WMETIS: ['0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000', 18],
      USDT: ['0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC', 6],
      'USDT-METIS-LP': ['0x3D60aFEcf67e6ba950b499137A72478B2CA7c5A1', 18],
      'PEAK-METIS-LP': ['0x603e67714A1b910DCCFDcae86dbeC9467de16f4c', 18],
      'PRO-METIS-LP': ['0x9F881c2a9cF0ff6639A346b30AB6E663071Cb4C1', 18],
    },
    baseLaunchDate: new Date('2021-06-02 13:00:00Z'),
    bondLaunchesAt: new Date('2020-12-03T15:00:00Z'),
    masonryLaunchesAt: new Date('2020-12-11T00:00:00Z'),
    refreshInterval: 10000,
  },
};

export const bankDefinitions: { [contractName: string]: BankInfo } = {
  /*
  Explanation:
  name: description of the card
  poolId: the poolId assigned in the contract
  sectionInUI: way to distinguish in which of the 3 pool groups it should be listed
        - 0 = Single asset stake pools
        - 1 = LP asset staking rewarding PEAK
        - 2 = LP asset staking rewarding PSHARE
  contract: the contract name which will be loaded from the deployment.environmnet.json
  depositTokenName : the name of the token to be deposited
  earnTokenName: the rewarded token
  finished: will disable the pool on the UI if set to true
  sort: the order of the pool
  */
  PeakMetisRewardPool: {
    name: 'Pool deprecated. To earn PEAK, stake your funds in live genesis pool',
    poolId: 0,
    sectionInUI: 0,
    contract: 'PeakMetisRewardPool',
    depositTokenName: 'WMETIS',
    earnTokenName: 'PEAK',
    finished: false,
    sort: 1,
    closedForStaking: false,
  },
  PeakMetisRewardPoolV2: {
    name: '(Ended) Earn PEAK by staking METIS',
    poolId: 0,
    sectionInUI: 0,
    contract: 'PeakMetisRewardPoolV2',
    depositTokenName: 'WMETIS',
    earnTokenName: 'PEAK',
    finished: false,
    sort: 2,
    closedForStaking: true,
  },
  PeakMetisLPPeakRewardPool: {
    name: 'Earn PEAK by staking PEAK-METIS LP',
    poolId: 0,
    sectionInUI: 1,
    contract: 'PeakMetisLPPeakRewardPool',
    depositTokenName: 'PEAK-METIS-LP',
    earnTokenName: 'PEAK',
    finished: false,
    sort: 5,
    closedForStaking: true,
  },
  PeakMetisLPPShareRewardPool: {
    name: 'Earn PRO by staking PEAK-METIS LP',
    poolId: 0,
    sectionInUI: 2,
    contract: 'PeakMetisLPPShareRewardPool',
    depositTokenName: 'PEAK-METIS-LP',
    earnTokenName: 'PRO',
    finished: false,
    sort: 6,
    closedForStaking: false,
  },
  PshareMetisLPPShareRewardPool: {
    name: 'Earn PRO by staking PRO-METIS LP',
    poolId: 1,
    sectionInUI: 2,
    contract: 'PshareMetisLPPShareRewardPool',
    depositTokenName: 'PRO-METIS-LP',
    earnTokenName: 'PRO',
    finished: false,
    sort: 7,
    closedForStaking: false,
  },
};

export default configurations[process.env.REACT_APP_ENV || 'dev'];
