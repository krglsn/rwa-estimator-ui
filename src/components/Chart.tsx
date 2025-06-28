import PriceChart from './PriceChart';
import {useEffect, useState} from "preact/hooks";
import {useToken} from "../context/TokenContext.tsx";
import {ethers} from "ethers";
import {CONTRACT_CONFIG} from "../config/chain.ts";
import RealEstateToken from "../abi/RealEstateToken.json";
import type {JsonRpcProvider} from "ethers";

type Props = {
    provider: JsonRpcProvider | null
}

export default function PriceEpochChart({provider}: Props) {

    const {selectedTokenId, currentEpochId} = useToken()
    const [priceData, setPriceData] = useState<Array<{ epochId: number, price: number }>>([]);
    const [oraclePriceData, setOraclePriceData] = useState<Array<{ epochId: number, price: number }>>([]);
    const [, setLoading] = useState(true);
    const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateToken.abi, provider);

    useEffect(() => {
        const fetchPriceData = async () => {
            try {
                setLoading(true);
                const prices = [];
                const oraclePrices = [];
                const numEpochs = 10;
                const startEpoch = Math.max(0, Number(currentEpochId) - numEpochs + 1)

                for (let i = startEpoch; i <= startEpoch + numEpochs - 1; i++) {
                    try {
                        const price = await token.getEpochPrice(selectedTokenId, i);
                        const oraclePrice = await token.getOraclePrice(selectedTokenId, i);
                        prices.push({epochId: i, price: Number(price)});
                        oraclePrices.push({epochId: i, price: Number(oraclePrice)});
                    } catch (err) {
                        console.error(`Error getting price ${i}:`, err);
                    }
                }
                setPriceData(prices);
                setOraclePriceData(oraclePrices);
                setLoading(false);
            } catch (err) {
                console.error("Error loading price data:", err);
                setLoading(false);
            }
        };

        if (provider) {
            fetchPriceData();
        }
    }, [provider]);

    return <PriceChart priceData={priceData} oraclePriceData={oraclePriceData} />;

}
