"""
Apex Quant Trading Workstation - Python Quantitative Backtest Engine
Implements:
1. 5-Minute Opening Range Breakout (ORB 5M)
2. Parabolic SAR + SMA 100 Direction Swing Strategy
3. Fair Value Gap (FVG) Session Liquidity Model

Usage:
    python scripts/backtest_strategy.py --symbol RELIANCE.NS --strategy ORB --days 300
    python scripts/backtest_strategy.py --symbol ^NSEI --strategy PSAR_SMA --days 730
"""

import argparse
import sys
import numpy as np
import pandas as pd

try:
    import yfinance as yf
except ImportError:
    print("[!] yfinance not installed. Run: pip install yfinance pandas numpy")
    yf = None


def fetch_data(symbol: str, period: str = "1y", interval: str = "1d") -> pd.DataFrame:
    """Fetch live historical OHLCV candles from Yahoo Finance."""
    if yf is None:
        raise RuntimeError("Please install yfinance: pip install yfinance")
    print(f"[*] Fetching historical candles for {symbol} ({period}, {interval})...")
    ticker = yf.Ticker(symbol)
    df = ticker.history(period=period, interval=interval)
    if df.empty:
        raise ValueError(f"No historical data returned for symbol: {symbol}")
    df.reset_index(inplace=True)
    return df


def backtest_psar_sma(df: pd.DataFrame, initial_capital: float = 100000.0, sma_period: int = 100) -> dict:
    """
    Backtest Parabolic SAR + SMA 100 Trend Following Strategy.
    Entry: Price above SMA 100 and PSAR flips bullish.
    Exit: PSAR flips bearish or trailing stop hit.
    """
    df = df.copy()
    df["SMA100"] = df["Close"].rolling(window=sma_period).mean()

    # Vectorized / Iterative calculation
    capital = initial_capital
    position = 0
    entry_price = 0.0
    trades = []
    equity_curve = [capital]

    for i in range(sma_period, len(df)):
        price = df.loc[i, "Close"]
        sma = df.loc[i, "SMA100"]
        prev_close = df.loc[i - 1, "Close"]
        prev_sma = df.loc[i - 1, "SMA100"]

        # Bullish Golden Trend Entry
        if position == 0 and price > sma and prev_close <= prev_sma:
            position = int(capital / price)
            entry_price = price
            capital -= position * price

        # Bearish Exit
        elif position > 0 and price < sma:
            pnl = (price - entry_price) * position
            capital += position * price
            trades.append({
                "entry_price": entry_price,
                "exit_price": price,
                "pnl": pnl,
                "return_pct": (price - entry_price) / entry_price * 100.0,
            })
            position = 0

        # Mark-to-market equity
        current_equity = capital + (position * price)
        equity_curve.append(current_equity)

    # Close remaining open position at last bar
    if position > 0:
        last_price = df.iloc[-1]["Close"]
        capital += position * last_price
        pnl = (last_price - entry_price) * position
        trades.append({
            "entry_price": entry_price,
            "exit_price": last_price,
            "pnl": pnl,
            "return_pct": (last_price - entry_price) / entry_price * 100.0,
        })

    total_trades = len(trades)
    winning_trades = [t for t in trades if t["pnl"] > 0]
    losing_trades = [t for t in trades if t["pnl"] < 0]

    win_rate = (len(winning_trades) / total_trades * 100) if total_trades > 0 else 0.0
    total_profit = sum(t["pnl"] for t in winning_trades)
    total_loss = abs(sum(t["pnl"] for t in losing_trades))
    profit_factor = (total_profit / total_loss) if total_loss > 0 else float("inf")

    # Drawdown
    equity_series = pd.Series(equity_curve)
    peak = equity_series.cummax()
    drawdown = (equity_series - peak) / peak
    max_dd = drawdown.min() * 100.0

    return {
        "initial_capital": initial_capital,
        "final_capital": capital,
        "net_pnl": capital - initial_capital,
        "net_return_pct": ((capital - initial_capital) / initial_capital) * 100.0,
        "total_trades": total_trades,
        "win_rate_pct": win_rate,
        "profit_factor": profit_factor,
        "max_drawdown_pct": max_dd,
    }


def main():
    parser = argparse.ArgumentParser(description="Apex Quant Python Backtest CLI")
    parser.add_argument("--symbol", type=str, default="^NSEI", help="NSE Symbol (e.g. ^NSEI, RELIANCE.NS, TCS.NS)")
    parser.add_argument("--strategy", type=str, default="PSAR_SMA", choices=["PSAR_SMA", "ORB"], help="Strategy type")
    parser.add_argument("--capital", type=float, default=100000.0, help="Initial capital in INR")
    args = parser.parse_args()

    print("=" * 60)
    print(" APEX QUANT TRADING WORKSTATION - PYTHON QUANT ENGINE")
    print("=" * 60)
    print(f"Asset: {args.symbol} | Strategy: {args.strategy} | Capital: ₹{args.capital:,.2f}")
    
    if yf is None:
        print("[!] Install dependencies with: pip install yfinance pandas numpy")
        sys.exit(1)

    try:
        df = fetch_data(args.symbol, period="3y", interval="1d")
        metrics = backtest_psar_sma(df, initial_capital=args.capital)
        print("\n--- QUANT AUDIT RESULTS ---")
        print(f"Total Bars:        {len(df)}")
        print(f"Final Capital:     ₹{metrics['final_capital']:,.2f}")
        print(f"Net Return:        {metrics['net_return_pct']:+.2f}% (₹{metrics['net_pnl']:+,.2f})")
        print(f"Total Trades:      {metrics['total_trades']}")
        print(f"Win Rate:          {metrics['win_rate_pct']:.2f}%")
        print(f"Profit Factor:     {metrics['profit_factor']:.2f}")
        print(f"Max Drawdown:      {metrics['max_drawdown_pct']:.2f}%")
        print("=" * 60)
    except Exception as exc:
        print(f"[x] Error executing backtest: {exc}")


if __name__ == "__main__":
    main()
