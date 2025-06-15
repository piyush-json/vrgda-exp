"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceChart = PriceChart;
const chart_1 = require("~/components/ui/chart");
const chart_2 = require("~/components/ui/chart");
const recharts_1 = require("recharts");
function PriceChart({ auctionData }) {
    if (auctionData.length === 0)
        return null;
    return (<div className='h-[250px] w-full'>
      <h3 className='text-sm font-medium mb-2'>VRGDA Price Curve</h3>
      <chart_1.ChartContainer config={{}} className='aspect-[none] h-[220px]'>
        <recharts_1.LineChart data={auctionData}>
          <chart_2.ChartTooltip content={<chart_2.ChartTooltipContent />}/>
          <recharts_1.CartesianGrid vertical={false} stroke='rgba(0,0,0,0.1)'/>
          <recharts_1.XAxis dataKey='time' axisLine={false} tickLine={false} label={{
            value: 'Time (days)',
            position: 'insideBottom',
            offset: -5
        }}/>
          <recharts_1.Line type='monotone' dataKey='price' stroke='red' strokeWidth={2} dot={false}/>
        </recharts_1.LineChart>
      </chart_1.ChartContainer>
    </div>);
}
