import random
from decimal import Decimal
from typing import Any, Dict, List
from sqlalchemy.orm import Session
from ..models import Company, TransactionDraft, DraftStatus
from .reports import profit_loss, trial_balance, balance_sheet

def calculate_materiality_and_samples(
    db: Session,
    company_id: str,
    seed: int = 42,
    sample_percent: float = 0.20,
    branch_id: str | None = None
) -> Dict[str, Any]:
    # 1. Fetch P&L and Balance Sheet to evaluate benchmark
    pnl = profit_loss(db, company_id, branch_id=branch_id)
    bs = balance_sheet(db, company_id, branch_id=branch_id)
    
    revenue = abs(pnl.income)
    assets = abs(bs.assets)
    profit = pnl.net_profit
    
    # SA 320 Benchmarking rules:
    # Profit-oriented: 5% of normalized profit before tax.
    # Loss-making / startup: 1% of revenue or 2% of assets, whichever is higher.
    if profit > 0:
        benchmark = "Net Profit"
        benchmark_value = profit
        planning_materiality = profit * Decimal("0.05")
    else:
        if revenue >= assets:
            benchmark = "Total Revenue"
            benchmark_value = revenue
            planning_materiality = revenue * Decimal("0.01")
        else:
            benchmark = "Total Assets"
            benchmark_value = assets
            planning_materiality = assets * Decimal("0.02")
            
    # Default minimum if planning materiality is zero
    if planning_materiality == 0:
        planning_materiality = Decimal("5000.00")
        benchmark = "Default Minimum Threshold"
        benchmark_value = Decimal("0.00")

    # Performance Materiality: usually 75% of planning materiality (SA 320)
    performance_materiality = planning_materiality * Decimal("0.75")
    
    # Posting Materiality (de minimis): 5% of planning materiality
    posting_materiality = planning_materiality * Decimal("0.05")
    
    # 2. SA 530 Sampling
    # Query all posted transaction drafts for this company
    query = db.query(TransactionDraft).filter(
        TransactionDraft.company_id == company_id,
        TransactionDraft.status == DraftStatus.POSTED
    )
    if branch_id:
        query = query.filter(TransactionDraft.branch_id == branch_id)
        
    transactions = query.order_by(TransactionDraft.created_at).all()
    
    # Seed standard random generator for reproducibility
    rng = random.Random(seed)
    
    # Sample selection
    sample_size = max(5, int(len(transactions) * sample_percent))
    sample_size = min(sample_size, len(transactions))
    
    sampled = rng.sample(transactions, sample_size) if transactions else []
    
    # Sort by date
    sampled.sort(key=lambda x: x.entry_date)
    
    return {
        "planning_materiality": planning_materiality.quantize(Decimal("0.01")),
        "performance_materiality": performance_materiality.quantize(Decimal("0.01")),
        "posting_materiality": posting_materiality.quantize(Decimal("0.01")),
        "benchmark": benchmark,
        "benchmark_value": benchmark_value.quantize(Decimal("0.01")),
        "sample_seed": seed,
        "sampled_transactions": sampled
    }
