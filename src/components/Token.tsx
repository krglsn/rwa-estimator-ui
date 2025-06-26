import {ethers, getAddress, type JsonRpcProvider, ZeroAddress} from "ethers";
import {useEffect, useState} from "preact/hooks";
import {CONTRACT_CONFIG} from "../config/chain.ts";
import RealEstateTokenABI from "../abi/RealEstateToken.json";
import Pool from "../abi/Pool.json"
import {useWallet} from "../lib/useWallet.ts";
import {CopyableAddress} from "./CopyAddress.tsx";
import {useToken} from "../context/TokenContext.tsx";

type Props = {
    provider: JsonRpcProvider | null
}

type TokenPlan = {
    rentAmount: number,
    epochDuration: number,
    programEnd: number
}

export default function Token({provider}: Props) {

    const {selectedTokenId} = useToken();
    const [currentPrice, setCurrentPrice] = useState<number>(0)
    const [poolAddress, setPoolAddress] = useState<string | null>(null)
    const [poolBalanceNative, setPoolBalanceNative] = useState<number | null>(null)
    const [poolBalance, setPoolBalance] = useState<number | null>(null)
    const [paymentDeposited, setPaymentDeposited] = useState<number>(0)
    const [userBalanceNative, setUserBalanceNative] = useState<number | null>(null)
    const [userBalance, setUserBalance] = useState<number | null>(null)
    const [supply, setSupply] = useState<number | null>(null)
    const [safetyAmount, setSafetyAmount] = useState<number>(0)
    const [safetyDueAmount, setSafetyDueAmount] = useState<number>(0)
    const [epochEndTime, setEpochEndTime] = useState<number | null>(null)
    const [plan, setPlan] = useState<TokenPlan | null>(null)
    const {currentEpochId, setCurrentEpochId} = useToken();

    const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateTokenABI.abi, provider);
    const {account,} = useWallet()

    useEffect(() => {
        async function updateEpoch() {
            const poolAddress = await token.getPool(selectedTokenId)
            if (getAddress(poolAddress) !== ZeroAddress) {
                try {
                    const pool = new ethers.Contract(poolAddress, Pool.abi, provider)
                    const [epoch, endTime]: [number, number] = await pool.getEpoch();
                    setEpochEndTime(Number(endTime));
                    setCurrentEpochId(epoch)
                    const plan: TokenPlan = await pool.getPlan()
                    setPlan(plan)
                    setPoolAddress(poolAddress)
                    setPoolBalanceNative(Number(await provider?.getBalance(poolAddress)))
                    setPoolBalance(Number(await token.balanceOf(poolAddress, selectedTokenId)))
                    account && setUserBalance(Number(await token.balanceOf(account, selectedTokenId)))
                    account && setUserBalanceNative(Number(await provider?.getBalance(account)))
                    setSafetyAmount(Number(await pool.safetyAmount()))
                    setSafetyDueAmount(Number(await pool.safetyAmountDue()))
                    setPaymentDeposited(Number(await pool.paymentDeposited()))
                    setCurrentPrice(Number(await pool.getPrice()))
                } catch (e: unknown) {
                    if (e instanceof Error) {
                        console.error("Error calling contract:", e.message);
                    } else {
                        console.error("Unknown error:", e);
                    }
                }
            } else {
                setEpochEndTime(null)
                setCurrentEpochId(0)
                setPlan(null)
                setPoolAddress(null)
                setPoolBalanceNative(0)
                setPoolBalance(0)
                account && setUserBalance(Number(await token.balanceOf(account, selectedTokenId)))
                setUserBalanceNative(0)
            }
        }

        if (provider) {
            updateEpoch();
        } else {
            console.warn("No provider");
        }


    }, [provider, selectedTokenId, account])

    useEffect(() => {

        async function updateTotalSupply(selectedTokenId: number) {
            try {
                const supply = await token['totalSupply(uint256)'](selectedTokenId);
                setSupply(supply)
                console.log("Supply retrieved: ", supply)
            } catch (e: unknown) {
                if (e instanceof Error) {
                    console.error("Error calling contract:", e.message);
                } else {
                    console.error("Unknown error:", e);
                }
            }
        }

        updateTotalSupply(selectedTokenId);

    }, [selectedTokenId])

    return (
            <div className="card card-xs w-full bg-base-100 card-border shadow-md p-4">
                <div className="card-title justify-center">
                    Pool Information
                </div>
                <div className="card-body">
                    <div className="flex flex-col gap-4">
                        <ul className="menu w-full">
                            <li>
                                <span>Pool:<span className="badge justify-self-end">{poolAddress ?
                                    <CopyableAddress address={poolAddress}></CopyableAddress>
                                    : "n/a"}</span></span>
                            </li>
                            <li>
                                <span>Rent payment, WEI:
                                    <span className="badge justify-self-end">
                                        {plan ? `${plan.rentAmount}` : 'n/a'}
                                    </span>
                                </span>
                            </li>
                            <li>
                                <span>Epoch duration, s:
                                    <span className="badge justify-self-end">
                                        {plan ? `${plan.epochDuration}` : 'n/a'}
                                    </span>
                                </span>
                            </li>
                            <li>
                                <span>Program end:
                                    <span className="badge justify-self-end">
                                        {plan ? `${new Date(Number(plan.programEnd) * 1000).toISOString()}` : 'n/a'}
                                    </span>
                                </span>
                            </li>
                            <li>
                                <span>Total supply, RWA:<span
                                    className="badge justify-self-end">{supply !== null ? `${supply}` : 'n/a'}</span></span>
                            </li>
                            <li>
                                <span>Pool balance, RWA:
                                    <span className="badge justify-self-end">{poolBalance}</span>
                                </span>
                            </li>
                            <li>
                                <span>Pool balance, WEI:
                                    <span className="badge justify-self-end">{poolBalanceNative}</span>
                                </span>
                            </li>
                            <li>
                                <span>Safety requirement, WEI:
                                    <span className="badge justify-self-end">{safetyAmount}</span>
                                </span>
                            </li>
                            <li>
                                <span>Safety due, WEI:
                                    <span className="badge justify-self-end">{safetyDueAmount}</span>
                                </span>
                            </li>
                            <li>
                                <span>Deposited, WEI:
                                    <span className="badge justify-self-end">{paymentDeposited}</span>
                                </span>
                            </li>
                            <li >
                                <span>Current price, WEI:
                                    <span className="badge justify-self-end">{currentPrice}</span>
                                </span>
                            </li>
                            <li >
                                <span>Current epoch:
                                    <span className="badge justify-self-end">{currentEpochId}</span>
                                </span>
                            </li>
                            <li >
                                <span>Epoch end:
                                    <span className="badge justify-self-end">{epochEndTime ? new Date(epochEndTime * 1000).toISOString() : ""}</span>
                                </span>
                            </li>

                        </ul>
                    </div>

                    <div>
                        User balance native: {userBalanceNative} WEI
                    </div>
                    <div>
                        User RWA balance: {userBalance} RWA
                    </div>
                </div>
            </div>
    )

}