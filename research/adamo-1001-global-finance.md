# Adamo 1001 — global finance research absorbed into WOLF

Adamo 1001 is a **paper-research** experiment. It does not promise returns, recommend trades, prepare orders, or authorize spend.

## QuantConnect
Patterns absorbed:
- brute-force/grid search across parameter combinations;
- explicit optimization objectives;
- walk-forward / out-of-sample separation;
- overfitting warnings;
- drawdown and Sharpe-style objectives.

References:
- https://www.quantconnect.com/docs/v2/writing-algorithms/optimization/walk-forward-optimization
- https://www.quantconnect.com/docs/v2/cloud-platform/optimization/strategies
- https://www.quantconnect.com/docs/v2/cloud-platform/optimization/objectives
- https://www.quantconnect.com/docs/v2/cloud-platform/optimization/parameters

## TradingView
Patterns absorbed:
- backtest and forward-test are different evidence classes;
- historical strategy performance is simulation, not proof of future performance.

References:
- https://www.tradingview.com/support/solutions/43000562362-what-are-strategies-backtesting-and-forward-testing/
- https://it.tradingview.com/support/solutions/43000666199/

## Composer
Patterns absorbed:
- model historical logic as a hypothetical backtest;
- keep historical simulation clearly separate from live trading assumptions;
- never convert a backtest result into a recommendation.

References:
- https://help.composer.trade/article/67-backtest-basics
- https://www.composer.trade/learn/how-do-backtests-work-in-composer

## Koyfin
Patterns absorbed:
- risk metrics belong next to performance;
- allocations and model portfolios need concentration / drawdown context.

Reference:
- https://www.koyfin.com/help/model-portfolios/

## TIKR
Patterns absorbed:
- global screening across regions, industries, fundamentals and valuation;
- bull/base/bear scenario thinking;
- assumptions should be adjustable rather than hidden.

References:
- https://www.tikr.com/it
- https://www.tikr.com/it/valuation-model-builder
- https://support.tikr.com/hc/en-us/articles/5365410657563-How-to-use-the-powerful-Global-Equity-Screener

## Adamo 1001 synthesis

The experiment runs:

1. £100 starting paper capital, £500 research target.
2. Exactly 1001 deterministic strategy candidates.
3. Market universe: diversified broad-market ETF proxies.
4. Explicit fee and slippage assumptions.
5. Train / validation / out-of-sample test separation.
6. Rejection for drawdown, unstable train-test gap, weak validation or negative out-of-sample behavior.
7. Best surviving candidate is subjected to 1001 bootstrap stress paths.
8. Result is compared with a buy-and-hold baseline.
9. Na0mi V8 evaluates whether the research result is eligible for further Xi0 review.
10. Live trading, order preparation, spending and Xi0 live authority remain disabled.

The target £100→£500 is deliberately difficult. A correct Adamo result can be **NO PROMOTION**.

## Core invariant

**Trying 1001 strategies does not create 1001 pieces of evidence.**

More trials increase the risk of data mining and overfitting. Adamo therefore treats brute-force discovery as the beginning of evaluation, not the end.
