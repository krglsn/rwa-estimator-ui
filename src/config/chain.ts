type ContractConfig = {
    realEstateTokenAddress: string;
    realEstateTokenABI: string;
    poolABI: string;
    wsRpc: string;
    rpc: string;
};

const CONFIGS: Record<string, ContractConfig> = {
    localhost: {
        realEstateTokenAddress: '0xE74BDF2B6F8D37204aa0deD8AD0476F3c42FbF7d',
        realEstateTokenABI: '/src/abi/RealEstateToken.json',
        poolABI: '/src/abi/Pool.json',
        wsRpc: 'ws://127.0.0.1:8545',
        rpc: 'http://127.0.0.1:8545',
    },
    fuji: {
        realEstateTokenAddress: '0xB46e99FcdCD78E8A6cd06E8e0d81Df1a6e577fD0',
        realEstateTokenABI: '/src/abi/RealEstateToken.json',
        poolABI: '/src/abi/Pool.json',
        wsRpc: import.meta.env.VITE_WS_URL || 'wss://avalanche-fuji.drpc.org',
        rpc: import.meta.env.VITE_RPC_URL || 'https://avalanche-fuji.drpc.org',
    },
};

const ENV = import.meta.env.VITE_CHAIN_ENV || 'localhost'
export const CONTRACT_CONFIG = CONFIGS[ENV]