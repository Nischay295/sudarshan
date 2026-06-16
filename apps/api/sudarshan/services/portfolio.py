import math
import random
from decimal import Decimal
from typing import Any, Dict, List, Tuple

# Risk-free rate (6.5% standard Indian Government Bond yield)
RF_RATE = 0.065

TICKERS = ["RELIANCE", "TCS", "INFOSYS", "HDFC", "ICICI"]

EXPECTED_RETURNS = {
    "RELIANCE": 0.15,
    "TCS": 0.14,
    "INFOSYS": 0.13,
    "HDFC": 0.12,
    "ICICI": 0.16
}

VOLATILITIES = {
    "RELIANCE": 0.22,
    "TCS": 0.18,
    "INFOSYS": 0.20,
    "HDFC": 0.16,
    "ICICI": 0.24
}

CORRELATIONS = {
    ("RELIANCE", "TCS"): 0.30,
    ("RELIANCE", "INFOSYS"): 0.25,
    ("RELIANCE", "HDFC"): 0.40,
    ("RELIANCE", "ICICI"): 0.45,
    ("TCS", "INFOSYS"): 0.70,
    ("TCS", "HDFC"): 0.35,
    ("TCS", "ICICI"): 0.38,
    ("INFOSYS", "HDFC"): 0.32,
    ("INFOSYS", "ICICI"): 0.35,
    ("HDFC", "ICICI"): 0.60,
}

def get_covariance(ticker_a: str, ticker_b: str) -> float:
    if ticker_a == ticker_b:
        return VOLATILITIES[ticker_a] ** 2
    key = (ticker_a, ticker_b) if (ticker_a, ticker_b) in CORRELATIONS else (ticker_b, ticker_a)
    corr = CORRELATIONS.get(key, 0.0)
    return corr * VOLATILITIES[ticker_a] * VOLATILITIES[ticker_b]

def optimize_portfolio(tickers: List[str], seed: int = 42, num_portfolios: int = 2000) -> Dict[str, Any]:
    # Filter tickers to only those we have data for
    active_tickers = [t for t in tickers if t in TICKERS]
    if not active_tickers:
        active_tickers = TICKERS

    n = len(active_tickers)
    
    # Seed generator for reproducibility (SA 530 / GIPS)
    rng = random.Random(seed)
    
    best_sharpe = -1.0
    best_weights = {}
    best_return = 0.0
    best_vol = 0.0
    
    # Monte Carlo Optimization Loop
    for _ in range(num_portfolios):
        # Generate random weights
        raw_weights = [rng.random() for _ in range(n)]
        sum_weights = sum(raw_weights)
        weights = [w / sum_weights for w in raw_weights]
        
        # Portfolio expected return
        p_return = sum(weights[i] * EXPECTED_RETURNS[active_tickers[i]] for i in range(n))
        
        # Portfolio variance
        p_variance = 0.0
        for i in range(n):
            for j in range(n):
                p_variance += weights[i] * weights[j] * get_covariance(active_tickers[i], active_tickers[j])
        
        p_vol = math.sqrt(p_variance)
        
        # Sharpe Ratio
        sharpe = (p_return - RF_RATE) / p_vol if p_vol > 0 else 0.0
        
        if sharpe > best_sharpe:
            best_sharpe = sharpe
            best_weights = {active_tickers[i]: weights[i] for i in range(n)}
            best_return = p_return
            best_vol = p_vol
            
    return {
        "optimal_weights": {k: Decimal(str(v)).quantize(Decimal("0.0001")) for k, v in best_weights.items()},
        "expected_portfolio_return": Decimal(str(best_return)).quantize(Decimal("0.0001")),
        "expected_portfolio_volatility": Decimal(str(best_vol)).quantize(Decimal("0.0001")),
        "sharpe_ratio": Decimal(str(best_sharpe)).quantize(Decimal("0.0001"))
    }

# BSM Option Pricing & Greeks
def erf(x: float) -> float:
    sign = 1 if x >= 0 else -1
    x = abs(x)
    a1 =  0.254829592
    a2 = -0.284496736
    a3 =  1.421413741
    a4 = -1.453152027
    a5 =  1.061405429
    p  =  0.3275911
    t = 1.0 / (1.0 + p * x)
    y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * math.exp(-x * x)
    return sign * y

def cnd(x: float) -> float:
    return 0.5 * (1.0 + erf(x / math.sqrt(2.0)))

def normal_pdf(x: float) -> float:
    return math.exp(-x * x / 2.0) / math.sqrt(2.0 * math.pi)

def price_bsm_option(
    spot: float,
    strike: float,
    time_to_maturity: float,
    r: float,
    vol: float,
    option_type: str = "call"
) -> Dict[str, Any]:
    # Guard against invalid values
    if time_to_maturity <= 0 or vol <= 0 or spot <= 0 or strike <= 0:
        return {
            "option_price": Decimal("0.00"), "delta": Decimal("0.0000"), "gamma": Decimal("0.0000"),
            "theta": Decimal("0.0000"), "vega": Decimal("0.0000"), "rho": Decimal("0.0000"),
            "d1": Decimal("0.0000"), "d2": Decimal("0.0000")
        }
        
    d1 = (math.log(spot / strike) + (r + (vol ** 2) / 2.0) * time_to_maturity) / (vol * math.sqrt(time_to_maturity))
    d2 = d1 - vol * math.sqrt(time_to_maturity)
    
    n_d1 = cnd(d1)
    n_d2 = cnd(d2)
    n_neg_d1 = cnd(-d1)
    n_neg_d2 = cnd(-d2)
    pdf_d1 = normal_pdf(d1)
    
    if option_type.lower() == "call":
        price = spot * n_d1 - strike * math.exp(-r * time_to_maturity) * n_d2
        delta = n_d1
        theta = - (spot * pdf_d1 * vol) / (2.0 * math.sqrt(time_to_maturity)) - r * strike * math.exp(-r * time_to_maturity) * n_d2
        rho = strike * time_to_maturity * math.exp(-r * time_to_maturity) * n_d2
    else:
        price = strike * math.exp(-r * time_to_maturity) * n_neg_d2 - spot * n_neg_d1
        delta = n_d1 - 1.0
        theta = - (spot * pdf_d1 * vol) / (2.0 * math.sqrt(time_to_maturity)) + r * strike * math.exp(-r * time_to_maturity) * n_neg_d2
        rho = -strike * time_to_maturity * math.exp(-r * time_to_maturity) * n_neg_d2
        
    gamma = pdf_d1 / (spot * vol * math.sqrt(time_to_maturity))
    vega = spot * math.sqrt(time_to_maturity) * pdf_d1
    
    return {
        "option_price": Decimal(str(price)).quantize(Decimal("0.01")),
        "d1": Decimal(str(d1)).quantize(Decimal("0.0001")),
        "d2": Decimal(str(d2)).quantize(Decimal("0.0001")),
        "delta": Decimal(str(delta)).quantize(Decimal("0.0001")),
        "gamma": Decimal(str(gamma)).quantize(Decimal("0.0001")),
        "theta": Decimal(str(theta)).quantize(Decimal("0.0001")),
        "vega": Decimal(str(vega)).quantize(Decimal("0.0001")),
        "rho": Decimal(str(rho)).quantize(Decimal("0.0001"))
    }

# Fixed-Income Analytics
def price_bond(coupon: float, face_value: float, ytm: float, years: int) -> float:
    price = 0.0
    for t in range(1, years + 1):
        price += coupon / ((1.0 + ytm) ** t)
    price += face_value / ((1.0 + ytm) ** years)
    return price

def calculate_bond_metrics(coupon: float, face_value: float, ytm: float, years: int) -> Tuple[float, float, float]:
    price = price_bond(coupon, face_value, ytm, years)
    if price <= 0:
        return 0.0, 0.0, 0.0
        
    # Macaulay Duration
    mac_dur = 0.0
    for t in range(1, years + 1):
        mac_dur += (t * coupon) / ((1.0 + ytm) ** t)
    mac_dur += (years * face_value) / ((1.0 + ytm) ** years)
    mac_dur /= price
    
    # Modified Duration
    mod_dur = mac_dur / (1.0 + ytm)
    
    # Convexity
    convexity = 0.0
    for t in range(1, years + 1):
        convexity += (t * (t + 1) * coupon) / ((1.0 + ytm) ** (t + 2))
    convexity += (years * (years + 1) * face_value) / ((1.0 + ytm) ** (years + 2))
    convexity /= price
    
    return mac_dur, mod_dur, convexity
