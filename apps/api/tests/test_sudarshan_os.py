from datetime import date
from decimal import Decimal
import json
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from sudarshan.database import Base, get_db
from sudarshan.main import app
from sudarshan.models import Company, AIAgent, Workflow, AnomalyAlert, CustomerProfile, Product
from sudarshan.services.seeding import seed_sudarshan_data

from sqlalchemy.pool import StaticPool

# In-memory database for testing
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db():
    Base.metadata.create_all(bind=engine)
    db_session = TestingSessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    
    test_client = TestClient(app)
    # Automatically inject the valid company key for standard tests
    orig_request = test_client.request
    def patched_request(*args, **kwargs):
        headers = kwargs.get("headers")
        if headers is None:
            headers = {}
        else:
            headers = dict(headers)
            
        bypass_auth = headers.pop("bypass_auth", None) == "true"
        if "X-Company-Key" not in headers and not bypass_auth:
            headers["X-Company-Key"] = "demo123"
        kwargs["headers"] = headers
        return orig_request(*args, **kwargs)
    test_client.request = patched_request

    yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def seeded_company(db):
    # Create a company and seed it
    from sudarshan.services.auth import hash_password
    company = Company(
        id="57d7e525-f829-42bd-bb2d-ae46a3ef1370",
        name="Demo Company",
        gstin="27ABCDE1234F1Z5",
        financial_year_start=date(2026, 4, 1),
        financial_year_end=date(2027, 3, 31),
        password_hash=hash_password("demo123")
    )
    db.add(company)
    db.commit()
    seed_sudarshan_data(db, company.id)
    return company


def test_get_founder_insights(client, seeded_company):
    response = client.get(f"/companies/{seeded_company.id}/founder-insights")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    # verify schema
    alert = data[0]
    assert "id" in alert
    assert "title" in alert
    assert "description" in alert
    assert "severity" in alert
    assert "is_resolved" in alert


def test_ai_workspace_chat(client, seeded_company):
    # Test chat default prompt
    response = client.post(
        f"/companies/{seeded_company.id}/ai-workspace/chat",
        json={"prompt": "hello"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "recommendations" in data
    assert "tasks" in data
    assert "automations" in data

    # Test revenue prompt response
    response = client.post(
        f"/companies/{seeded_company.id}/ai-workspace/chat",
        json={"prompt": "how can we increase revenue?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "revenue" in data["response"] or "sales" in data["response"].lower()
    assert len(data["recommendations"]) > 0

    # Test inventory prompt response
    response = client.post(
        f"/companies/{seeded_company.id}/ai-workspace/chat",
        json={"prompt": "check stock status"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "inventory" in data["response"] or "headphones" in data["response"].lower()


def test_get_ai_agents(client, seeded_company):
    response = client.get(f"/companies/{seeded_company.id}/agents")
    assert response.status_code == 200
    agents = response.json()
    assert len(agents) > 0
    # There should be CFO agent and others seeded
    cfo = next((a for a in agents if "CFO" in a["name"]), None)
    assert cfo is not None
    assert cfo["is_enabled"] is True


def test_toggle_ai_agent(client, db, seeded_company):
    agents = db.query(AIAgent).filter(AIAgent.company_id == seeded_company.id).all()
    agent_to_toggle = agents[0]
    initial_status = agent_to_toggle.is_enabled

    response = client.post(
        f"/companies/{seeded_company.id}/agents/{agent_to_toggle.id}/toggle",
        json={"is_enabled": not initial_status}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_enabled"] == (not initial_status)

    # Check database status
    db.expire_all()
    db_agent = db.get(AIAgent, agent_to_toggle.id)
    assert db_agent.is_enabled == (not initial_status)


def test_run_digital_twin_simulation(client, seeded_company):
    payload = {
        "name": "Price elasticity simulation",
        "description": "Increase price and marketing spend",
        "capital_change": 50000.0,
        "price_change_percent": 10.0,
        "marketing_spend": 10000.0,
        "hiring_count": 2
    }
    response = client.post(
        f"/companies/{seeded_company.id}/digital-twin/simulate",
        json=payload
    )
    assert response.status_code == 200
    result = response.json()
    assert result["scenario_name"] == payload["name"]
    assert "projected_revenue" in result
    assert "projected_net_profit" in result
    assert "projected_cash_balance" in result
    assert "roi" in result
    assert "risk_level" in result
    assert "advice" in result


def test_workflows_get_and_post(client, db, seeded_company):
    # Get initial workflows
    response = client.get(f"/companies/{seeded_company.id}/workflows")
    assert response.status_code == 200
    initial_workflows = response.json()
    assert len(initial_workflows) > 0

    # Post new workflow
    nodes = [
        {"id": "1", "type": "trigger", "label": "Transaction alert", "x": 50, "y": 100},
        {"id": "2", "type": "notify", "label": "Slack ping", "x": 250, "y": 100}
    ]
    new_workflow_payload = {
        "name": "New custom notification flow",
        "trigger_event": "transaction.created",
        "nodes_json": json.dumps(nodes),
        "is_active": True
    }
    response = client.post(
        f"/companies/{seeded_company.id}/workflows",
        json=new_workflow_payload
    )
    assert response.status_code == 200
    created_workflow = response.json()
    assert created_workflow["name"] == new_workflow_payload["name"]

    # Verify database
    db.expire_all()
    workflow_in_db = db.query(Workflow).filter(
        Workflow.company_id == seeded_company.id,
        Workflow.name == new_workflow_payload["name"]
    ).first()
    assert workflow_in_db is not None
    assert workflow_in_db.trigger_event == new_workflow_payload["trigger_event"]


def test_get_customers(client, seeded_company):
    response = client.get(f"/companies/{seeded_company.id}/customers")
    assert response.status_code == 200
    customers = response.json()
    assert len(customers) > 0
    assert "name" in customers[0]
    assert "total_spent" in customers[0]
    assert "churn_probability" in customers[0]


def test_get_executive_summary(client, seeded_company):
    response = client.get(f"/companies/{seeded_company.id}/executive-summary")
    assert response.status_code == 200
    summary = response.json()
    assert "revenue" in summary
    assert "net_profit" in summary
    assert "customer_count" in summary
    assert "product_count" in summary
    assert "active_alerts" in summary
    assert "risk_level" in summary


def test_developer_keys(client, seeded_company):
    # GET developer keys
    response = client.get(f"/companies/{seeded_company.id}/developer/keys")
    assert response.status_code == 200
    keys = response.json()
    assert len(keys) >= 2
    assert any(k["key_name"] == "Production API Key" for k in keys)

    # POST developer key
    payload = {"key_name": "Test Key"}
    response = client.post(f"/companies/{seeded_company.id}/developer/keys", json=payload)
    assert response.status_code == 200
    new_key = response.json()
    assert new_key["key_name"] == "Test Key"
    assert new_key["api_key"].startswith("sd_live_")


def test_marketplace_agents(client, seeded_company):
    # GET agents
    response = client.get(f"/companies/{seeded_company.id}/marketplace/agents")
    assert response.status_code == 200
    agents = response.json()
    assert len(agents) >= 3
    billing_agent = next(a for a in agents if "Auto-Billing" in a["name"])
    assert billing_agent["developer_name"] == "Antigravity Labs"

    # POST publish agent
    payload = {
        "developer_name": "Antigravity Devs",
        "name": "Sudarshan Test Agent",
        "description": "A test marketplace agent",
        "category": "Utility",
        "price_monthly": 19.99
    }
    response = client.post(f"/companies/{seeded_company.id}/marketplace/agents/publish", json=payload)
    assert response.status_code == 200
    new_agent = response.json()
    assert new_agent["name"] == "Sudarshan Test Agent"

    # POST review
    review_payload = {
        "user": "Test Reviewer",
        "rating": 5,
        "comment": "Perfect!"
    }
    response = client.post(f"/companies/{seeded_company.id}/marketplace/agents/{new_agent['id']}/review", json=review_payload)
    assert response.status_code == 200
    updated_agent = response.json()
    assert updated_agent["ratings_count"] == 2  # 1 default + 1 new
    assert updated_agent["ratings_sum"] == 10  # 5 default + 5 new


def test_get_digital_twin_scenarios(client, seeded_company):
    # First, run a simulation to create a scenario
    payload = {
        "name": "Historical Simulation 1",
        "description": "Marketing test",
        "capital_change": 10000.0,
        "price_change_percent": 5.0,
        "marketing_spend": 2000.0,
        "hiring_count": 0
    }
    sim_resp = client.post(f"/companies/{seeded_company.id}/digital-twin/simulate", json=payload)
    assert sim_resp.status_code == 200

    # GET scenarios
    response = client.get(f"/companies/{seeded_company.id}/digital-twin/scenarios")
    assert response.status_code == 200
    scenarios = response.json()
    assert len(scenarios) > 0
    assert scenarios[0]["name"] == "Historical Simulation 1"
    assert "params" in scenarios[0]
    assert "results" in scenarios[0]


def test_company_vault_passwords(client, seeded_company):
    # 1. Accessing without the header should return 401
    response = client.get(f"/companies/{seeded_company.id}/founder-insights", headers={"bypass_auth": "true"})
    assert response.status_code == 401
    assert "X-Company-Key header missing" in response.json()["detail"]

    # 2. Accessing with an invalid header should return 401
    response = client.get(
        f"/companies/{seeded_company.id}/founder-insights",
        headers={"X-Company-Key": "wrongpassword"}
    )
    assert response.status_code == 401
    assert "Invalid Company Password" in response.json()["detail"]

    # 3. Accessing with a correct header (which is auto-injected by client fixture as "demo123") should return 200
    response = client.get(f"/companies/{seeded_company.id}/founder-insights")
    assert response.status_code == 200

    # 4. Create a new company via POST
    new_company_payload = {
        "name": "Secure Vault Co",
        "gstin": "27BBBBB1111B1Z2",
        "financial_year_start": "2026-04-01",
        "financial_year_end": "2027-03-31",
        "password": "supersecretpassword"
    }
    response = client.post("/companies", json=new_company_payload)
    assert response.status_code == 200
    new_co = response.json()
    assert new_co["name"] == "Secure Vault Co"

    # 5. Unlock company successfully
    unlock_payload = {
        "name": "Secure Vault Co",
        "password": "supersecretpassword"
    }
    response = client.post("/companies/unlock", json=unlock_payload)
    assert response.status_code == 200
    unlocked_co = response.json()
    assert unlocked_co["id"] == new_co["id"]

    # 6. Unlock company with wrong password
    unlock_payload_wrong = {
        "name": "Secure Vault Co",
        "password": "wrongpassword"
    }
    response = client.post("/companies/unlock", json=unlock_payload_wrong)
    assert response.status_code == 401

    # 7. Get metadata batch
    metadata_payload = {
        "ids": [seeded_company.id, new_co["id"]]
    }
    response = client.post("/companies/metadata", json=metadata_payload)
    assert response.status_code == 200
    metadata = response.json()
    assert len(metadata) == 2
    assert any(m["id"] == seeded_company.id for m in metadata)
    assert any(m["id"] == new_co["id"] for m in metadata)


def test_create_and_verify_payment(client, db, seeded_company):
    # 1. Create a payment order
    response = client.post(f"/companies/{seeded_company.id}/payments/create-order")
    assert response.status_code == 200
    order_data = response.json()
    assert "id" in order_data
    assert order_data["amount"] == 99900
    assert order_data["currency"] == "INR"
    assert "key_id" in order_data

    # 2. Verify with mock signature (should succeed and update company subscription status)
    verify_payload = {
        "razorpay_order_id": order_data["id"],
        "razorpay_payment_id": "pay_mock_123",
        "razorpay_signature": "mock_signature_for_testing"
    }
    response = client.post(f"/companies/{seeded_company.id}/payments/verify", json=verify_payload)
    assert response.status_code == 200
    verify_data = response.json()
    assert verify_data["status"] == "success"
    assert verify_data["subscription_status"] == "active"
    assert verify_data["subscription_expires_at"] is not None

    # Check database model directly
    db.expire_all()
    updated_company = db.get(Company, seeded_company.id)
    assert updated_company.subscription_status == "active"
    assert updated_company.subscription_expires_at is not None

    # 3. Verify with invalid signature (should fail for order IDs that don't start with order_mock_)
    import os
    # Temporarily set a dummy key secret to force signature check
    os.environ["RAZORPAY_KEY_SECRET"] = "dummy_secret_for_test"
    try:
        invalid_verify_payload = {
            "razorpay_order_id": "order_real_123",
            "razorpay_payment_id": "pay_real_123",
            "razorpay_signature": "invalid_sig"
        }
        response = client.post(f"/companies/{seeded_company.id}/payments/verify", json=invalid_verify_payload)
        assert response.status_code == 400
    finally:
        # Restore environment variable
        os.environ.pop("RAZORPAY_KEY_SECRET", None)


def test_audit_materiality_sampling(client, seeded_company):
    response = client.get(f"/companies/{seeded_company.id}/audit/materiality-sampling?seed=42&sample_percent=0.2")
    assert response.status_code == 200
    data = response.json()
    assert "planning_materiality" in data
    assert "performance_materiality" in data
    assert "posting_materiality" in data
    assert "benchmark" in data
    assert "sampled_transactions" in data
    assert isinstance(data["sampled_transactions"], list)


def test_portfolio_optimization(client, seeded_company):
    payload = {
        "tickers": ["RELIANCE", "TCS", "INFOSYS"],
        "seed": 100
    }
    response = client.post(f"/companies/{seeded_company.id}/portfolio/optimize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "optimal_weights" in data
    assert "expected_portfolio_return" in data
    assert "expected_portfolio_volatility" in data
    assert "sharpe_ratio" in data
    assert "RELIANCE" in data["optimal_weights"]


def test_bsm_option_pricing(client, seeded_company):
    payload = {
        "spot_price": 100.0,
        "strike_price": 105.0,
        "time_to_maturity_years": 0.5,
        "risk_free_rate": 0.05,
        "volatility": 0.20,
        "option_type": "call"
    }
    response = client.post(f"/companies/{seeded_company.id}/portfolio/bsm-price", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "option_price" in data
    assert "delta" in data
    assert "gamma" in data
    assert "theta" in data
    assert "vega" in data
    assert "rho" in data


def test_bond_metrics(client, seeded_company):
    payload = {
        "coupon": 8.0,
        "face_value": 100.0,
        "ytm": 0.06,
        "years": 5
    }
    response = client.post(f"/companies/{seeded_company.id}/portfolio/bond-metrics", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "macaulay_duration_years" in data
    assert "modified_duration_years" in data
    assert "convexity" in data


