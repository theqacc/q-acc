import {
  arbitrum,
  avalanche,
  base,
  blast,
  celo,
  fantom,
  filecoin,
  fraxtal,
  immutableZkEvm,
  kava,
  linea,
  mainnet,
  mantle,
  moonbeam,
  optimism,
  polygon,
  scroll,
  polygonZkEvm,
  gnosis,
  zksync,
  bsc,
} from '@reown/appkit/networks';
import { polygon as viemPolygon } from 'wagmi/chains';
// import { polygon, polygonZkEvm } from 'wagmi/chains';

import { EnvConfig } from '@/types/config.type';
import { PrivadoContractMethodV2 } from '@/lib/constants/privado';

const config: EnvConfig = {
  SUPPORTED_CHAINS: [
    polygon,
    mainnet,
    arbitrum,
    avalanche,
    optimism,
    base,
    linea,
    celo,
    mantle,
    moonbeam,
    fantom,
    scroll,
    kava,
    filecoin,
    blast,
    fraxtal,
    immutableZkEvm,
    polygonZkEvm,
    gnosis,
    zksync,
    bsc,
  ] as const,
  SCAN_URL: 'https://polygonscan.com/',
  ERC_TOKEN_ADDRESS: '0x0000000000000000000000000000000000000000',
  WPOL_TOKEN_ADDRESS: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  ERC_TOKEN_SYMBOL: 'POL',
  GRAPHQL_ENDPOINT:
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
    'https://qacc-be.generalmagic.io/graphql',
  AUTH_BASE_ROUTE:
    process.env.NEXT_PUBLIC_AUTH_BASE_ROUTE || 'https://auth.giveth.io/v1',
  GIVETH_GQL_ENDPOINT: 'https://mainnet.serve.giveth.io/graphql',
  INDEXER_GRAPHQL_URL: 'https://indexer.hyperindex.xyz/a414bf3/v1/graphql',
  privadoConfig: {
    chain: viemPolygon,
    chainName: 'Polygon',
    contractAddress: '0xfcc86A79fCb057A8e55C6B853dff9479C3cf607c',
    allowedIssuers: [
      'did:iden3:privado:main:2ScrbEuw9jLXMapW3DELXBbDco5EURzJZRN1tYj7L7',
    ],
    requestId: 12,
    webWalletBaseUrl: 'https://wallet.privado.id',
    verifierDid:
      'did:iden3:polygon:amoy:x6x5sor7zpyefHwZu9RE4xiuRWBkq9xAEHxrKbKWb',
    method: PrivadoContractMethodV2,
  },
  GP_ANALYSIS_SCORE_THRESHOLD: 50,
  GP_SCORER_SCORE_THRESHOLD: 15,
  MINIMUM_DONATION_AMOUNT: 10,
  MATCHING_FUND_ADDRESS: [],
  SQUID_INTEGRATOR_ID: 'test-project-4ba94915-f432-4d42-89df-53c6de4dd93e',
};

export default config;