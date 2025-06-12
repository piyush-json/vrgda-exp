
// Generate random chart data
const generateChartData = (days: number, trend: "up" | "down" | "volatile") => {
  const data = [];
  let price = Math.random() * 0.1;

  for (let i = 0; i < days; i++) {
    let change;

    if (trend === "up") {
      change = Math.random() * 0.1 - 0.03; // Mostly positive
    } else if (trend === "down") {
      change = Math.random() * 0.1 - 0.07; // Mostly negative
    } else {
      change = Math.random() * 0.2 - 0.1; // Volatile
    }

    price = Math.max(0.00001, price + change);

    data.push({
      time: `${i}h`,
      price: price,
    });
  }

  return data;
};

// Generate mock tokens
export const mockTokens = [
  {
    id: "1",
    name: "Solana Pump",
    symbol: "PUMP",
    logo: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?q=80&w=200&h=200&auto=format&fit=crop",
    price: 0.0025,
    priceChange24h: 15.4,
    marketCap: 2500000,
    holders: 1250,
    launchDate: "2023-10-15",
    description:
      "A community-driven token focused on creating a sustainable ecosystem on Solana.",
    chartData: generateChartData(24, "up"),
  },
  {
    id: "2",
    name: "Moon Shot",
    symbol: "MOON",
    logo: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?q=80&w=200&h=200&auto=format&fit=crop",
    price: 0.00075,
    priceChange24h: -8.2,
    marketCap: 750000,
    holders: 890,
    launchDate: "2023-11-05",
    description:
      "Aiming to revolutionize DeFi on Solana with innovative staking mechanisms.",
    chartData: generateChartData(24, "down"),
  },
  {
    id: "3",
    name: "Solana Doge",
    symbol: "SOLDOGE",
    logo: "https://images.unsplash.com/photo-1647693812652-3b33d0e45e9c?q=80&w=200&h=200&auto=format&fit=crop",
    price: 0.00005,
    priceChange24h: 32.7,
    marketCap: 500000,
    holders: 2100,
    launchDate: "2023-09-20",
    description:
      "The first community-owned meme token on Solana with real utility.",
    chartData: generateChartData(24, "up"),
  },
  {
    id: "4",
    name: "Solana AI",
    symbol: "SAI",
    logo: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=200&h=200&auto=format&fit=crop",
    price: 0.0185,
    priceChange24h: 5.3,
    marketCap: 18500000,
    holders: 3500,
    launchDate: "2023-08-10",
    description:
      "Integrating AI capabilities with Solana blockchain for next-gen applications.",
    chartData: generateChartData(24, "volatile"),
  },
  {
    id: "5",
    name: "Solana Gaming",
    symbol: "SGAME",
    logo: "https://images.unsplash.com/photo-1640765773329-68a0b8a6a14e?q=80&w=200&h=200&auto=format&fit=crop",
    price: 0.0042,
    priceChange24h: -3.8,
    marketCap: 4200000,
    holders: 1850,
    launchDate: "2023-10-01",
    description:
      "Building the future of blockchain gaming on Solana with play-to-earn mechanics.",
    chartData: generateChartData(24, "down"),
  },
  {
    id: "6",
    name: "Sol Finance",
    symbol: "SOLFIN",
    logo: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=200&h=200&auto=format&fit=crop",
    price: 0.0078,
    priceChange24h: 12.1,
    marketCap: 7800000,
    holders: 2750,
    launchDate: "2023-09-05",
    description:
      "Decentralized finance solutions built on Solana for maximum efficiency and low fees.",
    chartData: generateChartData(24, "up"),
  },
];
