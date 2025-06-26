import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

interface PricePoint {
    epochId: number;
    price: number;
}

interface PriceChartProps {
    priceData: PricePoint[];
    oraclePriceData: PricePoint[];
    title?: string;
    weightedColor?: string;
    oracleColor?: string;
}

const PriceChart = ({
    priceData,
    oraclePriceData,
    title = 'Price by epoch',
    weightedColor = '#8884d8',
    oracleColor = '#82ca9d'
}: PriceChartProps) => {
    const sortedWeightedData = [...priceData].sort((a, b) => a.epochId - b.epochId);
    const sortedOracleData = [...oraclePriceData].sort((a, b) => a.epochId - b.epochId);

    const allEpochIds = new Set([
        ...sortedWeightedData.map(item => item.epochId),
        ...sortedOracleData.map(item => item.epochId)
    ]);

    const combinedData = Array.from(allEpochIds).map(epochId => {
        const weightedItem = sortedWeightedData.find(item => item.epochId === epochId);
        const oracleItem = sortedOracleData.find(item => item.epochId === epochId);

        return {
            epochId,
            weightedPrice: weightedItem?.price,
            oraclePrice: oracleItem?.price
        };
    }).sort((a, b) => a.epochId - b.epochId);

    console.log("Combined chart data:", combinedData);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-base-100 p-2 border border-base-300 rounded shadow-md">
                    <p className="text-sm">Epoch ID: {label}</p>
                    {payload.map((entry: any, index: number) => {
                        const name = entry.dataKey === "weightedPrice"
                            ? "Weighted price"
                            : "Oracle price";

                        return (
                            <p key={index} style={{ color: entry.color }}>
                                {name}: {entry.value} WEI
                            </p>
                        );
                    })}
                </div>
            );
        }
        return null;
    };


    return (
        <div className="card bg-base-100 rounded-xl p-4 shadow-md">
            <h3 className="text-xl font-medium mb-4">{title}</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={combinedData}
                        margin={{top: 5, right: 30, left: 20, bottom: 5}}
                    >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis
                            dataKey="epochId"
                            label={{value: 'Epoch ID', position: 'insideBottomRight', offset: -10}}
                        />
                        <YAxis
                            label={{value: 'Price, WEI', angle: -90, position: 'insideLeft'}}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="weightedPrice"
                            stroke={weightedColor}
                            activeDot={{r: 8}}
                            dot={{r: 4}}
                            name="Weighted price"
                            connectNulls={true}
                        />
                        <Line
                            type="monotone"
                            dataKey="oraclePrice"
                            stroke={oracleColor}
                            activeDot={{r: 8}}
                            dot={{r: 4}}
                            name="Oracle price"
                            connectNulls={true}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PriceChart;