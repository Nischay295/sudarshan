export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://sudarshan-api.onrender.com";

export type Company = {
  id: string;
  name: string;
  gstin: string | null;
  financial_year_start: string;
  financial_year_end: string;
  subscription_status?: string;
  subscription_expires_at?: string | null;
  created_at: string;
};

export type DraftStatus = "draft" | "posted" | "exception";

export type TransactionDraft = {
  id: string;
  entry_date: string;
  description: string;
  amount: string;
  flow: string;
  counterparty: string | null;
  gst_rate: string;
  gst_treatment: string;
  confidence_score: string;
  status: DraftStatus;
  classification_reason: string | null;
  exception_reason: string | null;
  created_at: string;
};

export type LedgerLine = {
  id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  debit: string;
  credit: string;
  description: string;
  gst_bucket: string | null;
};

export type JournalEntry = {
  id: string;
  entry_number: string;
  entry_date: string;
  narration: string;
  status: string;
  created_at: string;
  lines: LedgerLine[];
};

export type TransactionResponse = {
  draft: TransactionDraft;
  journal_entry: JournalEntry | null;
};

export type TrialBalance = {
  rows: Array<{
    account_code: string;
    account_name: string;
    account_type: string;
    debit_total: string;
    credit_total: string;
    closing_debit: string;
    closing_credit: string;
  }>;
  total_debit: string;
  total_credit: string;
  is_balanced: boolean;
};

export type ProfitLoss = {
  income: string;
  expenses: string;
  net_profit: string;
};

export type BalanceSheet = {
  assets: string;
  liabilities: string;
  equity: string;
  current_period_profit: string;
  balanced: boolean;
};

export type GSTSummary = {
  input_gst: string;
  output_gst: string;
  net_payable: string;
  buckets: Record<string, string>;
};

export type ManagementReport = {
  title: string;
  accountant_explanation: string;
  management_summary: string;
  anomaly_notes: string[];
  business_advice: string[];
  investment_goal_commentary: string;
  advisory_disclaimer: string;
};

export type AnomalyAlert = {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  is_resolved: boolean;
  created_at: string;
};

export type AIAgent = {
  id: string;
  name: string;
  role: string;
  description: string;
  is_enabled: boolean;
  icon_name: string;
};

export type Workflow = {
  id: string;
  name: string;
  trigger_event: string;
  nodes_json: string;
  is_active: boolean;
  created_at: string;
};

export type CustomerProfile = {
  id: string;
  name: string;
  email: string | null;
  purchase_count: number;
  total_spent: string;
  churn_probability: string;
  risk_score: string;
  behavior_segment: string;
};

export type SimulationInput = {
  name: string;
  description?: string;
  capital_change: number;
  price_change_percent: number;
  marketing_spend: number;
  hiring_count: number;
};

export type SimulationResult = {
  scenario_name: string;
  projected_revenue: string;
  projected_net_profit: string;
  projected_cash_balance: string;
  roi: string;
  risk_level: string;
  advice: string[];
};

export type WorkspaceChatResponse = {
  response: string;
  recommendations: string[];
  tasks: Array<{
    description: string;
    status: string;
    action_type: string;
  }>;
  automations: Array<{
    name: string;
    trigger: string;
    is_active: boolean;
  }>;
};

export type ExecutiveSummary = {
  revenue: string;
  net_profit: string;
  customer_count: number;
  product_count: number;
  active_alerts: number;
  revenue_growth: string;
  conversion_rate: string;
  active_loyalty_users: number;
  risk_level: "low" | "medium" | "high";
  risk_summary: string;
};

export type DeveloperKey = {
  id: string;
  key_name: string;
  api_key: string;
  is_active: boolean;
  created_at: string;
};

export type MarketplaceAgent = {
  id: string;
  developer_name: string;
  name: string;
  description: string;
  category: string;
  price_monthly: string;
  ratings_sum: number;
  ratings_count: number;
  reviews_json: string;
  created_at: string;
};

export type SimulationScenario = {
  id: string;
  name: string;
  description: string | null;
  params: {
    name: string;
    description?: string;
    capital_change: number;
    price_change_percent: number;
    marketing_spend: number;
    hiring_count: number;
  };
  results: {
    projected_revenue: string;
    projected_net_profit: string;
    projected_cash_balance: string;
    roi: string;
    risk_level: string;
  };
  created_at: string;
};


async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // Extract companyId from URL path (e.g. /companies/{companyId}/...)
  const match = path.match(/^\/companies\/([^\/]+)/);
  const companyId = match ? match[1] : null;
  let companyKey: string | null = null;

  if (companyId && companyId !== "unlock" && companyId !== "metadata" && typeof window !== "undefined") {
    try {
      const unlocked = JSON.parse(localStorage.getItem("sudarshan_unlocked_companies") || "{}");
      companyKey = unlocked[companyId] || null;
    } catch (e) {
      console.error("Error reading company key from localStorage", e);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(companyKey ? { "X-Company-Key": companyKey } : {}),
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  companies: () => request<Company[]>("/companies"),
  createCompany: (body: {
    name: string;
    gstin?: string | null;
    financial_year_start: string;
    financial_year_end: string;
    password: string;
  }) => request<Company>("/companies", { method: "POST", body: JSON.stringify(body) }),
  unlockCompany: (body: {
    name: string;
    password: string;
  }) => request<Company>("/companies/unlock", {
    method: "POST",
    body: JSON.stringify(body)
  }),
  getCompaniesMetadata: (ids: string[]) =>
    request<Company[]>("/companies/metadata", {
      method: "POST",
      body: JSON.stringify({ ids })
    }),
  postTransaction: (
    companyId: string,
    body: {
      entry_date: string;
      description: string;
      amount: string;
      flow: string;
      counterparty?: string | null;
      gst_rate: string;
      gst_treatment: string;
      payment_account_code: string;
    }
  ) =>
    request<TransactionResponse>(`/companies/${companyId}/transactions/manual`, {
      method: "POST",
      body: JSON.stringify(body)
    }),
  transactions: (companyId: string) => request<TransactionDraft[]>(`/companies/${companyId}/transactions`),
  journals: (companyId: string) => request<JournalEntry[]>(`/companies/${companyId}/journal-entries`),
  trialBalance: (companyId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return request<TrialBalance>(`/companies/${companyId}/reports/trial-balance${qs}`);
  },
  profitLoss: (companyId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return request<ProfitLoss>(`/companies/${companyId}/reports/profit-loss${qs}`);
  },
  balanceSheet: (companyId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return request<BalanceSheet>(`/companies/${companyId}/reports/balance-sheet${qs}`);
  },
  gstSummary: (companyId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return request<GSTSummary>(`/companies/${companyId}/reports/gst-summary${qs}`);
  },
  managementReport: (companyId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return request<ManagementReport>(`/companies/${companyId}/ai/management-report${qs}`);
  },
  resetCompanyData: (companyId: string) =>
    request<{ status: string; message: string }>(`/companies/${companyId}/reset`, {
      method: "POST"
    }),
  getFounderInsights: (companyId: string) => request<AnomalyAlert[]>(`/companies/${companyId}/founder-insights`),
  sendChatPrompt: (companyId: string, prompt: string) =>
    request<WorkspaceChatResponse>(`/companies/${companyId}/ai-workspace/chat`, {
      method: "POST",
      body: JSON.stringify({ prompt })
    }),
  getAgents: (companyId: string) => request<AIAgent[]>(`/companies/${companyId}/agents`),
  toggleAgent: (companyId: string, agentId: string, isEnabled: boolean) =>
    request<AIAgent>(`/companies/${companyId}/agents/${agentId}/toggle`, {
      method: "POST",
      body: JSON.stringify({ is_enabled: isEnabled })
    }),
  runSimulation: (companyId: string, input: SimulationInput) =>
    request<SimulationResult>(`/companies/${companyId}/digital-twin/simulate`, {
      method: "POST",
      body: JSON.stringify(input)
    }),
  getWorkflows: (companyId: string) => request<Workflow[]>(`/companies/${companyId}/workflows`),
  saveWorkflow: (companyId: string, workflow: { name: string; trigger_event: string; nodes_json: string; is_active: boolean }) =>
    request<Workflow>(`/companies/${companyId}/workflows`, {
      method: "POST",
      body: JSON.stringify(workflow)
    }),
  getCustomers: (companyId: string) => request<CustomerProfile[]>(`/companies/${companyId}/customers`),
  getExecutiveSummary: (companyId: string) => request<ExecutiveSummary>(`/companies/${companyId}/executive-summary`),

  uploadTransactions: (companyId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    let companyKey = "";
    if (typeof window !== "undefined") {
      try {
        const unlocked = JSON.parse(localStorage.getItem("sudarshan_unlocked_companies") || "{}");
        companyKey = unlocked[companyId] || "";
      } catch (e) {}
    }

    return fetch(`${API_BASE_URL}/companies/${companyId}/transactions/upload`, {
      method: "POST",
      body: formData,
      headers: {
        ...(companyKey ? { "X-Company-Key": companyKey } : {})
      }
    }).then(async (res) => {
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(detail || `Upload failed with status ${res.status}`);
      }
      return res.json() as Promise<{
        filename: string;
        total_rows: number;
        posted_count: number;
        exception_count: number;
        results: Array<{
          description: string;
          amount: string;
          status: string;
          detail: string;
        }>;
      }>;
    });
  },
  getDeveloperKeys: (companyId: string) => request<DeveloperKey[]>(`/companies/${companyId}/developer/keys`),
  createDeveloperKey: (companyId: string, keyName: string) =>
    request<DeveloperKey>(`/companies/${companyId}/developer/keys`, {
      method: "POST",
      body: JSON.stringify({ key_name: keyName })
    }),
  getMarketplaceAgents: (companyId: string) => request<MarketplaceAgent[]>(`/companies/${companyId}/marketplace/agents`),
  publishMarketplaceAgent: (
    companyId: string,
    body: {
      developer_name: string;
      name: string;
      description: string;
      category: string;
      price_monthly: number;
    }
  ) =>
    request<MarketplaceAgent>(`/companies/${companyId}/marketplace/agents/publish`, {
      method: "POST",
      body: JSON.stringify(body)
    }),
  postAgentReview: (
    companyId: string,
    agentId: string,
    body: {
      user: string;
      rating: number;
      comment: string;
    }
  ) =>
    request<MarketplaceAgent>(`/companies/${companyId}/marketplace/agents/${agentId}/review`, {
      method: "POST",
      body: JSON.stringify(body)
    }),
  getSimulationScenarios: (companyId: string) => request<SimulationScenario[]>(`/companies/${companyId}/digital-twin/scenarios`),
  createRazorpayOrder: (companyId: string) =>
    request<{
      id: string;
      amount: number;
      currency: string;
      key_id: string;
      mock: boolean;
    }>(`/companies/${companyId}/payments/create-order`, {
      method: "POST"
    }),
  verifyRazorpayPayment: (
    companyId: string,
    body: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }
  ) =>
    request<{
      status: string;
      subscription_status: string;
      subscription_expires_at: string | null;
    }>(`/companies/${companyId}/payments/verify`, {
      method: "POST",
      body: JSON.stringify(body)
    })
};

