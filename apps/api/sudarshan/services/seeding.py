import json
from decimal import Decimal
from sqlalchemy.orm import Session
from ..models import Product, CustomerProfile, AIAgent, Workflow, AnomalyAlert, Company, DeveloperKey, MarketplaceAgent

def seed_sudarshan_data(db: Session, company_id: str):
    # Check if we already seeded products to avoid duplicates
    if db.query(Product).filter(Product.company_id == company_id).first():
        return # Already seeded
        
    print(f"Seeding Sudarshan OS metrics for company: {company_id}")
    
    # 1. Seed Products
    products = [
        Product(
            company_id=company_id,
            name="Wireless Headphones",
            sku="HW-WH-001",
            price=Decimal("45231.00"),
            stock_quantity=3,
            reorder_point=10
        ),
        Product(
            company_id=company_id,
            name="Smart Watch Series 8",
            sku="HW-SW-008",
            price=Decimal("32456.00"),
            stock_quantity=25,
            reorder_point=12
        ),
        Product(
            company_id=company_id,
            name="Running Shoes",
            sku="AP-RS-002",
            price=Decimal("28965.00"),
            stock_quantity=14,
            reorder_point=15
        ),
        Product(
            company_id=company_id,
            name="Coffee Maker",
            sku="AP-CM-012",
            price=Decimal("18642.00"),
            stock_quantity=8,
            reorder_point=8
        ),
        Product(
            company_id=company_id,
            name="Backpack Travel",
            sku="AP-BT-099",
            price=Decimal("12357.00"),
            stock_quantity=19,
            reorder_point=10
        )
    ]
    db.add_all(products)
    
    # 2. Seed Customer Profiles
    customers = [
        CustomerProfile(
            company_id=company_id,
            name="John Doe",
            email="john.doe@gmail.com",
            purchase_count=18,
            total_spent=Decimal("24500.00"),
            churn_probability=Decimal("0.1200"),
            risk_score=Decimal("0.0800"),
            behavior_segment="Loyal"
        ),
        CustomerProfile(
            company_id=company_id,
            name="Jane Smith",
            email="jane.smith@outlook.com",
            purchase_count=12,
            total_spent=Decimal("18500.00"),
            churn_probability=Decimal("0.0400"),
            risk_score=Decimal("0.0200"),
            behavior_segment="Loyal"
        ),
        CustomerProfile(
            company_id=company_id,
            name="Robert Brown",
            email="robert.b@yahoo.com",
            purchase_count=2,
            total_spent=Decimal("3120.00"),
            churn_probability=Decimal("0.8200"),
            risk_score=Decimal("0.9000"),
            behavior_segment="At Risk"
        ),
        CustomerProfile(
            company_id=company_id,
            name="Emily Davis",
            email="emily.d@gmail.com",
            purchase_count=22,
            total_spent=Decimal("27800.00"),
            churn_probability=Decimal("0.1800"),
            risk_score=Decimal("0.1500"),
            behavior_segment="Active"
        ),
        CustomerProfile(
            company_id=company_id,
            name="Michael Wilson",
            email="mwilson@gmail.com",
            purchase_count=1,
            total_spent=Decimal("1230.00"),
            churn_probability=Decimal("0.9500"),
            risk_score=Decimal("0.9800"),
            behavior_segment="Lost"
        )
    ]
    db.add_all(customers)
    
    # 3. Seed AI Agents
    agents = [
        AIAgent(
            company_id=company_id,
            name="CFO Agent (Veda)",
            role="CFO",
            description="Monitors overall financial metrics, capital allocations, budget variances, and cash flow projections.",
            is_enabled=True,
            icon_name="TrendingUp"
        ),
        AIAgent(
            company_id=company_id,
            name="Tax Agent (Chanakya)",
            role="Tax",
            description="Calculates GST liability, structures e-invoicing pipelines, and flags tax exposure anomalies.",
            is_enabled=True,
            icon_name="FileText"
        ),
        AIAgent(
            company_id=company_id,
            name="CA Agent (Kautilya)",
            role="Auditor",
            description="Ensures compliance with IFRS/GAAP rules, runs continuous general ledger verification audits.",
            is_enabled=True,
            icon_name="ShieldCheck"
        ),
        AIAgent(
            company_id=company_id,
            name="Marketing Agent (Prachar)",
            role="CMO",
            description="Analyzes ad spend ROAS, competitor pricing actions, and drafts conversion campaigns.",
            is_enabled=False,
            icon_name="Megaphone"
        ),
        AIAgent(
            company_id=company_id,
            name="Inventory Agent (Kosh)",
            role="COO",
            description="Automates warehouse replenishments, tracks Batch/Expiry metrics, and runs stockout simulations.",
            is_enabled=False,
            icon_name="Package"
        ),
        AIAgent(
            company_id=company_id,
            name="Customer Support Agent (Seva)",
            role="CS",
            description="Handles customer support tickets, answers queries from the knowledge base, and tracks satisfaction KPIs.",
            is_enabled=False,
            icon_name="UserCheck"
        )
    ]
    db.add_all(agents)
    
    # 4. Seed Workflows (Canvas Node Layout JSONs)
    sample_nodes_1 = [
        {"id": "1", "type": "trigger", "label": "Low Stock (< Reorder Point)", "x": 100, "y": 150},
        {"id": "2", "type": "agent", "label": "Orchestrator routes to Inventory Agent", "x": 300, "y": 150},
        {"id": "3", "type": "action", "label": "Generate Purchase Order (Draft)", "x": 500, "y": 150},
        {"id": "4", "type": "notify", "label": "Email CFO for Approval", "x": 700, "y": 150}
    ]
    sample_nodes_2 = [
        {"id": "1", "type": "trigger", "label": "Customer Churn Risk > 80%", "x": 100, "y": 150},
        {"id": "2", "type": "agent", "label": "Marketing Agent Drafts Coupon code", "x": 300, "y": 150},
        {"id": "3", "type": "action", "label": "Email dynamic 15% discount to customer", "x": 500, "y": 150}
    ]
    
    workflows = [
        Workflow(
            company_id=company_id,
            name="Low Stock Auto-Replenish",
            trigger_event="inventory.low",
            nodes_json=json.dumps(sample_nodes_1),
            is_active=True
        ),
        Workflow(
            company_id=company_id,
            name="Cart Abandonment / Churn Recovery",
            trigger_event="customer.abandon",
            nodes_json=json.dumps(sample_nodes_2),
            is_active=False
        )
    ]
    db.add_all(workflows)
    
    # 5. Seed Anomaly Alerts
    alerts = [
        AnomalyAlert(
            company_id=company_id,
            type="revenue_risk",
            title="Revenue Risk Detected",
            description="Sales projected to drop 8.2% next month due to competitor's dynamic pricing campaign. Recommended action: Launch offer code 'SAVE8' to target at-risk users.",
            severity="high"
        ),
        AnomalyAlert(
            company_id=company_id,
            type="inventory_low",
            title="Critical Stock Warning",
            description="Wireless Headphones stock is at 3 units (reorder point: 10). Lead time: 5 days. Run replenishment workflow now.",
            severity="critical"
        ),
        AnomalyAlert(
            company_id=company_id,
            type="competitor_price",
            title="Competitor Pricing Opportunity",
            description="Competitor Y raised price for Smart Watch Series 8 from ₹32,456 to ₹34,999. Recommended action: Increase pricing to match and capture ₹45K additional profit.",
            severity="medium"
        ),
        AnomalyAlert(
            company_id=company_id,
            type="marketing_low",
            title="Marketing ROI Underperforming",
            description="Google Ad campaign 'Summer Sale 2026' is underperforming with ROI of 1.1x (target: 2.5x). Reallocate ₹50K to high-performing Facebook channels.",
            severity="medium"
        )
    ]
    db.add_all(alerts)
    
    # 6. Seed Developer Keys
    if not db.query(DeveloperKey).filter(DeveloperKey.company_id == company_id).first():
        dev_keys = [
            DeveloperKey(
                company_id=company_id,
                key_name="Production API Key",
                api_key="sd_live_a1b2c3d4e5f67890abcdef1234567890",
                is_active=True
            ),
            DeveloperKey(
                company_id=company_id,
                key_name="Staging API Key",
                api_key="sd_test_9876543210fedcba0987654321fedcba",
                is_active=True
            )
        ]
        db.add_all(dev_keys)

    # 7. Seed Marketplace Agents
    if not db.query(MarketplaceAgent).filter(MarketplaceAgent.company_id == company_id).first():
        m_agents = [
            MarketplaceAgent(
                company_id=company_id,
                developer_name="Antigravity Labs",
                name="Sudarshan Auto-Billing Agent",
                description="Automatically reconciles incoming invoices against purchase orders and flags variance mismatches.",
                category="Finance",
                price_monthly=Decimal("49.00"),
                ratings_sum=9,
                ratings_count=2,
                reviews_json=json.dumps([
                    {"user": "Alice", "rating": 5, "comment": "Saved us hours every week on invoice entry!"},
                    {"user": "Bob", "rating": 4, "comment": "Solid integration, very helpful insights."}
                ])
            ),
            MarketplaceAgent(
                company_id=company_id,
                developer_name="Quantum Commerce",
                name="Demand Predictor Pro",
                description="Simulates demand patterns using machine learning models trained on historical inventory flow and seasonal metrics.",
                category="Analytics",
                price_monthly=Decimal("79.00"),
                ratings_sum=5,
                ratings_count=1,
                reviews_json=json.dumps([
                    {"user": "Charlie", "rating": 5, "comment": "Surprisingly accurate forecasts for our Q4 sales!"}
                ])
            ),
            MarketplaceAgent(
                company_id=company_id,
                developer_name="Decentralized Systems",
                name="GST Smart Auditor",
                description="Continuous verification agent that maps ledgers to GST buckets, cross-checks HSN codes, and auto-generates draft GSTR returns.",
                category="Compliance",
                price_monthly=Decimal("99.00"),
                ratings_sum=10,
                ratings_count=2,
                reviews_json=json.dumps([
                    {"user": "Diana", "rating": 5, "comment": "Auditing GST has never been so seamless."},
                    {"user": "Evan", "rating": 5, "comment": "Absolute life saver during tax season."}
                ])
            )
        ]
        db.add_all(m_agents)

    db.commit()
    print("Seed complete.")
