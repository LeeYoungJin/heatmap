import { MarketData } from "@/types/market";

export const mockMarketData: MarketData = {
  name: "KOSPI/KOSDAQ",
  children: [
    {
      id: "semiconductor",
      name: "반도체",
      children: [
        { id: "samsung", name: "삼성전자", ticker: "005930", change: 1.5, value: 450 },
        { id: "skhynix", name: "SK하이닉스", ticker: "000660", change: 2.8, value: 120 },
        { id: "hanmi", name: "한미반도체", ticker: "042700", change: -1.2, value: 45 },
      ],
    },
    {
      id: "battery",
      name: "2차전지",
      children: [
        { id: "lgensol", name: "LG에너지솔루션", ticker: "373220", change: -2.5, value: 90 },
        { id: "posco", name: "POSCO홀딩스", ticker: "005490", change: -1.8, value: 35 },
        { id: "ecopro", name: "에코프로비엠", ticker: "247540", change: -3.2, value: 25 },
      ],
    },
    {
      id: "bio",
      name: "제약/바이오",
      children: [
        { id: "samsungbio", name: "삼성바이오로직스", ticker: "207940", change: 0.5, value: 60 },
        { id: "celltrion", name: "셀트리온", ticker: "068270", change: 1.2, value: 40 },
        { id: "yuhan", name: "유한양행", ticker: "000100", change: 4.5, value: 15 },
      ],
    },
    {
      id: "auto",
      name: "자동차",
      children: [
        { id: "hyundai", name: "현대차", ticker: "005380", change: 0.8, value: 50 },
        { id: "kia", name: "기아", ticker: "000270", change: 1.1, value: 40 },
        { id: "hyundaimobis", name: "현대모비스", ticker: "012330", change: -0.3, value: 20 },
      ],
    },
    {
      id: "finance",
      name: "금융",
      children: [
        { id: "kb", name: "KB금융", ticker: "105560", change: 2.1, value: 30 },
        { id: "shinhan", name: "신한지주", ticker: "055550", change: 1.5, value: 25 },
        { id: "hana", name: "하나금융지주", ticker: "086790", change: 0.7, value: 20 },
      ],
    },
    {
      id: "it",
      name: "IT/플랫폼",
      children: [
        { id: "naver", name: "NAVER", ticker: "035420", change: -1.5, value: 30 },
        { id: "kakao", name: "카카오", ticker: "035720", change: -2.1, value: 20 },
      ],
    },
  ],
};
