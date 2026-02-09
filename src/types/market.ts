export interface Stock {
  id: string;
  name: string;
  ticker: string;
  change: number; // percentage change
  value: number;  // market cap or volume for sizing
  currentPrice?: number;
}

export interface Sector {
  id: string;
  name: string;
  children: Stock[];
}

export interface MarketData {
  name: string;
  children: Sector[];
}
