"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  api,
  Company,
  TransactionDraft,
  JournalEntry,
  TrialBalance,
  ProfitLoss,
  BalanceSheet,
  GSTSummary,
  ManagementReport,
  AnomalyAlert,
  AIAgent,
  Workflow,
  CustomerProfile,
  SimulationResult,
  ExecutiveSummary,
  DeveloperKey,
  MarketplaceAgent,
  SimulationScenario,
  API_BASE_URL,
  Branch
} from "../lib/api";
import {
  Building2,
  PlusCircle,
  AlertCircle,
  FileText,
  BarChart3,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  FileCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Briefcase,
  Compass,
  MessageSquare,
  Bot,
  Brain,
  Zap,
  Users,
  Activity,
  Sliders,
  Wrench,
  Mail,
  Play,
  DollarSign,
  Shield,
  Code,
  Key,
  Globe,
  Star,
  Settings,
  Lock,
  Plus,
  ArrowRight,
  History,
  CreditCard
} from "lucide-react";



export default function AccountantWorkspace() {
  // Navigation & Shell State
  const [activeSection, setActiveSection] = useState<
    | "dashboard"
    | "workspace"
    | "marketplace"
    | "twin"
    | "canvas"
    | "customers"
    | "warroom"
    | "transaction"
    | "ledger"
    | "reports"
    | "advisory"
    | "developer"
  >("dashboard");

  // AI Commerce Operating System State
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [customersList, setCustomersList] = useState<CustomerProfile[]>([]);
  const [execSummary, setExecSummary] = useState<ExecutiveSummary | null>(null);
  const [chatPrompt, setChatPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{
    sender: "user" | "ai";
    text: string;
    recommendations?: string[];
    tasks?: any[];
    automations?: any[];
  }>>([
    {
      sender: "ai",
      text: "Hello Nischay! I am your AI Business Assistant. I am connected to your inventory, financial ledger, CRM, and active automation workflows. Ask me to: 'Analyze my inventory levels', 'How can we increase revenue?', or 'Show active workflows'."
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [simName, setSimName] = useState("Scenario: High growth price-marketing plan");
  const [simCapital, setSimCapital] = useState(0);
  const [simPriceChange, setSimPriceChange] = useState(5.0);
  const [simMarketing, setSimMarketing] = useState(25000);
  const [simHiring, setSimHiring] = useState(1);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Developer Keys & Marketplace States
  const [devKeys, setDevKeys] = useState<DeveloperKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [mAgents, setMAgents] = useState<MarketplaceAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<MarketplaceAgent | null>(null);
  const [reviewUser, setReviewUser] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [subscribedAgents, setSubscribedAgents] = useState<string[]>([]);
  
  // Publish Agent Form State
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [publishDevName, setPublishDevName] = useState("");
  const [publishAgentName, setPublishAgentName] = useState("");
  const [publishAgentDesc, setPublishAgentDesc] = useState("");
  const [publishAgentCat, setPublishAgentCat] = useState("Finance");
  const [publishAgentPrice, setPublishAgentPrice] = useState("49");
  const [isPublishingAgent, setIsPublishingAgent] = useState(false);

  // Webhook Delivery Logs Mock
  const [webhookLogs] = useState([
    { id: "wh_1", event: "ledger.transaction.posted", url: "https://api.acme.com/webhooks", status: 200, time: "Just now" },
    { id: "wh_2", event: "anomaly.alert.raised", url: "https://api.acme.com/webhooks", status: 200, time: "5 minutes ago" },
    { id: "wh_3", event: "customer.churn.risk_high", url: "https://api.acme.com/webhooks", status: 202, time: "2 hours ago" },
    { id: "wh_4", event: "inventory.stock.critical", url: "https://api.acme.com/webhooks", status: 500, attempt: 3, time: "4 hours ago" }
  ]);

  const [marketTab, setMarketTab] = useState<"platform" | "thirdparty">("platform");



  // Canvas Nodes State
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [workflowNodes, setWorkflowNodes] = useState<any[]>([]);
  const [isSavingWorkflow, setIsSavingWorkflow] = useState(false);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [isLoadingCompanies, setIsLoadingCompanies] = useState<boolean>(true);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [tempApiUrl, setTempApiUrl] = useState(API_BASE_URL);
  
  // Branch Management States
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchCode, setNewBranchCode] = useState("");
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const [txBranchId, setTxBranchId] = useState("");



  // Forms State
  const [showCompanyForm, setShowCompanyForm] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState("");
  const [companyGstin, setCompanyGstin] = useState("");
  const [companyPassword, setCompanyPassword] = useState("");
  const [onboardingMode, setOnboardingMode] = useState<"unlock" | "create">("unlock");
  const [fyStart, setFyStart] = useState("2026-04-01");
  const [fyEnd, setFyEnd] = useState("2027-03-31");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Transaction form state
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [txDescription, setTxDescription] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txFlow, setTxFlow] = useState("expense");
  const [txCounterparty, setTxCounterparty] = useState("");
  const [txGstRate, setTxGstRate] = useState("18");
  const [txGstTreatment, setTxGstTreatment] = useState("intra_state");
  const [txPaymentAccount, setTxPaymentAccount] = useState("1010");

  // Ingestion File State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    posted_count: number;
    exception_count: number;
    total_rows: number;
  } | null>(null);

  // Data State for selected company
  const [drafts, setDrafts] = useState<TransactionDraft[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [trialBalance, setTrialBalance] = useState<TrialBalance | null>(null);
  const [profitLoss, setProfitLoss] = useState<ProfitLoss | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
  const [gstSummary, setGstSummary] = useState<GSTSummary | null>(null);
  const [advisoryReport, setAdvisoryReport] = useState<ManagementReport | null>(null);

  // UI status
  const [activeReportTab, setActiveReportTab] = useState<"tb" | "pl" | "bs" | "gst" | "flow" | "investor">("tb");
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);
  const [isSubmittingCompany, setIsSubmittingCompany] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [txSuccessMessage, setTxSuccessMessage] = useState<string | null>(null);

  // Fetch Companies list
  const loadCompanies = useCallback(async (selectFirst = false) => {
    setIsLoadingCompanies(true);
    setApiError(null);
    try {
      let unlocked: Record<string, string> = {};
      try {
        unlocked = JSON.parse(localStorage.getItem("sudarshan_unlocked_companies") || "{}");
      } catch (e) {
        console.error("Failed to parse unlocked companies from localStorage", e);
      }

      const ids = Object.keys(unlocked);
      if (ids.length > 0) {
        const list = await api.getCompaniesMetadata(ids);
        setCompanies(list);
        if (list.length > 0) {
          if (selectFirst || !selectedCompanyId || !list.some(c => c.id === selectedCompanyId)) {
            setSelectedCompanyId(list[0].id);
          }
          setShowCompanyForm(false);
        } else {
          setShowCompanyForm(true);
        }
      } else {
        setCompanies([]);
        setShowCompanyForm(true);
      }
    } catch (err: any) {
      setApiError(err.message || "Failed to load companies");
    } finally {
      setIsLoadingCompanies(false);
    }
  }, [selectedCompanyId]);

  // Fetch all company-specific details
  const loadCompanyData = useCallback(async (companyId: string, startDate?: string, endDate?: string, branchId?: string) => {
    if (!companyId) return;
    setApiError(null);
    const apiBranchId = branchId === "all" ? undefined : branchId;
    try {
      const [
        draftsList, journalsList, tb, pl, bs, gst, advisory, alertList, agentList, workflowList, customerList, execSum,
        keysList, marketplaceList, scenariosList, branchesList
      ] = await Promise.all([
        api.transactions(companyId, apiBranchId).catch(() => [] as TransactionDraft[]),
        api.journals(companyId, apiBranchId).catch(() => [] as JournalEntry[]),
        api.trialBalance(companyId, startDate, endDate, apiBranchId).catch(() => null),
        api.profitLoss(companyId, startDate, endDate, apiBranchId).catch(() => null),
        api.balanceSheet(companyId, startDate, endDate, apiBranchId).catch(() => null),
        api.gstSummary(companyId, startDate, endDate, apiBranchId).catch(() => null),
        api.managementReport(companyId, startDate, endDate, apiBranchId).catch(() => null),
        api.getFounderInsights(companyId).catch(() => [] as AnomalyAlert[]),
        api.getAgents(companyId).catch(() => [] as AIAgent[]),
        api.getWorkflows(companyId).catch(() => [] as Workflow[]),
        api.getCustomers(companyId).catch(() => [] as CustomerProfile[]),
        api.getExecutiveSummary(companyId, apiBranchId).catch(() => null),
        api.getDeveloperKeys(companyId).catch(() => [] as DeveloperKey[]),
        api.getMarketplaceAgents(companyId).catch(() => [] as MarketplaceAgent[]),
        api.getSimulationScenarios(companyId).catch(() => [] as SimulationScenario[]),
        api.branches(companyId).catch(() => [] as Branch[])
      ]);

      setDrafts(draftsList);
      setJournals(journalsList);
      setTrialBalance(tb);
      setProfitLoss(pl);
      setBalanceSheet(bs);
      setGstSummary(gst);
      setAdvisoryReport(advisory);
      setAlerts(alertList);
      setAgents(agentList);
      setWorkflows(workflowList);
      setCustomersList(customerList);
      setExecSummary(execSum);
      setDevKeys(keysList);
      setMAgents(marketplaceList);
      setScenarios(scenariosList);
      setBranches(branchesList);

      if (branchesList.length > 0) {
        setTxBranchId(prev => prev || branchesList[0].id);
      }

      if (workflowList.length > 0) {
        setSelectedWorkflow(workflowList[0]);
        setWorkflowNodes(JSON.parse(workflowList[0].nodes_json));
      }

    } catch (err: any) {
      setApiError(err.message || "Failed to load company workspace data");
    }
  }, []);

  // Developer Keys & Marketplace actions
  const handleCreateDeveloperKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId || !newKeyName.trim()) return;
    setIsCreatingKey(true);
    setApiError(null);
    try {
      const newKey = await api.createDeveloperKey(selectedCompanyId, newKeyName);
      setDevKeys(prev => [newKey, ...prev]);
      setNewKeyName("");
      setTxSuccessMessage(`API Key "${newKey.key_name}" created successfully.`);
    } catch (err: any) {
      setApiError(err.message || "Failed to create developer key");
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId || !newBranchName.trim() || !newBranchCode.trim()) return;
    setIsCreatingBranch(true);
    setApiError(null);
    try {
      const newBranch = await api.createBranch(selectedCompanyId, {
        name: newBranchName,
        code: newBranchCode
      });
      setBranches(prev => [...prev, newBranch]);
      setNewBranchName("");
      setNewBranchCode("");
      setTxSuccessMessage(`Branch "${newBranch.name}" created successfully.`);
    } catch (err: any) {
      setApiError(err.message || "Failed to create branch");
    } finally {
      setIsCreatingBranch(false);
    }
  };

  const handlePublishMarketplaceAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId || !publishAgentName.trim() || !publishDevName.trim()) {
      setApiError("Name and Developer Name are required.");
      return;
    }
    setIsPublishingAgent(true);
    setApiError(null);
    try {
      const newAgent = await api.publishMarketplaceAgent(selectedCompanyId, {
        developer_name: publishDevName,
        name: publishAgentName,
        description: publishAgentDesc,
        category: publishAgentCat,
        price_monthly: parseFloat(publishAgentPrice) || 0
      });
      setMAgents(prev => [newAgent, ...prev]);
      setPublishAgentName("");
      setPublishAgentDesc("");
      setPublishDevName("");
      setShowPublishForm(false);
      setTxSuccessMessage(`Marketplace Agent "${newAgent.name}" published successfully.`);
    } catch (err: any) {
      setApiError(err.message || "Failed to publish agent");
    } finally {
      setIsPublishingAgent(false);
    }
  };

  const handlePostAgentReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId || !selectedAgent || !reviewUser.trim() || !reviewComment.trim()) {
      setApiError("User name and comment are required.");
      return;
    }
    setIsSubmittingReview(true);
    setApiError(null);
    try {
      const updatedAgent = await api.postAgentReview(selectedCompanyId, selectedAgent.id, {
        user: reviewUser,
        rating: reviewRating,
        comment: reviewComment
      });
      setMAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
      setSelectedAgent(updatedAgent);
      setReviewUser("");
      setReviewComment("");
      setTxSuccessMessage("Review posted successfully.");
    } catch (err: any) {
      setApiError(err.message || "Failed to post review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSubscribeAgent = (agentId: string) => {
    if (subscribedAgents.includes(agentId)) {
      setSubscribedAgents(prev => prev.filter(id => id !== agentId));
      setTxSuccessMessage("Agent subscription cancelled.");
    } else {
      setSubscribedAgents(prev => [...prev, agentId]);
      setTxSuccessMessage("Successfully subscribed to agent! Real-time telemetry is active.");
    }
  };


  // Initial load
  useEffect(() => {
    loadCompanies(true);
  }, []);

  // Reload data when selected company or branch changes
  useEffect(() => {
    if (selectedCompanyId) {
      const active = companies.find(c => c.id === selectedCompanyId);
      const start = filterStartDate || (active ? active.financial_year_start : undefined);
      const end = filterEndDate || (active ? active.financial_year_end : undefined);
      loadCompanyData(selectedCompanyId, start, end, selectedBranchId);
      setTxSuccessMessage(null);
    }
  }, [selectedCompanyId, selectedBranchId, loadCompanyData, companies]);

  const activeCompany = companies.find(c => c.id === selectedCompanyId);

  const isLocked = activeCompany && 
    activeCompany.subscription_status !== "active" && 
    (() => {
      const createdDate = new Date(activeCompany.created_at);
      const diffTime = new Date().getTime() - createdDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays > 7;
    })();

  const handleCheckout = async () => {
    if (!activeCompany) return;
    setIsSubscribing(true);
    try {
      const order = await api.createRazorpayOrder(activeCompany.id);
      
      if (typeof (window as any).Razorpay === "undefined") {
        alert("Razorpay SDK is loading. Please try again in a moment.");
        setIsSubscribing(false);
        return;
      }

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Sudarshan AI",
        description: "Commerce OS Monthly Subscription",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await api.verifyRazorpayPayment(activeCompany.id, {
              razorpay_order_id: response.razorpay_order_id || order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature || "mock_signature_for_testing"
            });
            
            if (verifyRes.status === "success") {
              alert("Subscription active! App unlocked.");
              await loadCompanies(false);
            } else {
              alert("Payment verification failed.");
            }
          } catch (e: any) {
            console.error("Verification failed", e);
            alert(`Verification failed: ${e.message}`);
          } finally {
            setIsSubscribing(false);
          }
        },
        prefill: {
          name: activeCompany.name,
          email: "billing@sudarshan.ai",
        },
        theme: {
          color: "#0d9488",
        },
        modal: {
          ondismiss: function() {
            setIsSubscribing(false);
          }
        }
      };

      if (order.mock) {
        alert("Developer mode / test mode detected. Simulating successful checkout...");
        setTimeout(async () => {
          try {
            const verifyRes = await api.verifyRazorpayPayment(activeCompany.id, {
              razorpay_order_id: order.id,
              razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
              razorpay_signature: "mock_signature_for_testing"
            });
            if (verifyRes.status === "success") {
              alert("Simulated subscription successful! App unlocked.");
              await loadCompanies(false);
            }
          } catch (e: any) {
            console.error("Verification failed", e);
            alert(`Simulated verification failed: ${e.message}`);
          } finally {
            setIsSubscribing(false);
          }
        }, 1000);
        return;
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      console.error("Failed to initiate subscription", e);
      alert(`Failed to start subscription: ${e.message}`);
      setIsSubscribing(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !companyPassword.trim()) {
      setApiError("Company Name and Password are required.");
      return;
    }

    setIsSubmittingCompany(true);
    setApiError(null);
    try {
      const newCompany = await api.createCompany({
        name: companyName,
        gstin: companyGstin.trim() || undefined,
        financial_year_start: fyStart,
        financial_year_end: fyEnd,
        password: companyPassword.trim()
      });

      // Save password to localStorage
      try {
        const unlocked = JSON.parse(localStorage.getItem("sudarshan_unlocked_companies") || "{}");
        unlocked[newCompany.id] = companyPassword.trim();
        localStorage.setItem("sudarshan_unlocked_companies", JSON.stringify(unlocked));
      } catch (e) {
        console.error("Failed to save password to localStorage", e);
      }

      setCompanyName("");
      setCompanyGstin("");
      setCompanyPassword("");
      setShowCompanyForm(false);
      setSelectedCompanyId(newCompany.id);
      await loadCompanies(false);
    } catch (err: any) {
      setApiError(err.message || "Failed to create company");
    } finally {
      setIsSubmittingCompany(false);
    }
  };

  const handleUnlockCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !companyPassword.trim()) {
      setApiError("Company Name and Password are required.");
      return;
    }

    setIsSubmittingCompany(true);
    setApiError(null);
    try {
      const company = await api.unlockCompany({
        name: companyName.trim(),
        password: companyPassword.trim()
      });

      // Save password to localStorage
      try {
        const unlocked = JSON.parse(localStorage.getItem("sudarshan_unlocked_companies") || "{}");
        unlocked[company.id] = companyPassword.trim();
        localStorage.setItem("sudarshan_unlocked_companies", JSON.stringify(unlocked));
      } catch (e) {
        console.error("Failed to save password to localStorage", e);
      }

      setCompanyName("");
      setCompanyPassword("");
      setShowCompanyForm(false);
      setSelectedCompanyId(company.id);
      await loadCompanies(false);
    } catch (err: any) {
      setApiError(err.message || "Failed to unlock company. Please verify the name and password.");
    } finally {
      setIsSubmittingCompany(false);
    }
  };

  // Handle Transaction Submission
  const handlePostTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;
    if (!txDescription.trim() || !txAmount) {
      setApiError("Description and Amount are required.");
      return;
    }

    setIsSubmittingTx(true);
    setApiError(null);
    setTxSuccessMessage(null);

    try {
      const response = await api.postTransaction(selectedCompanyId, {
        entry_date: entryDate,
        description: txDescription,
        amount: txAmount,
        flow: txFlow,
        counterparty: txCounterparty.trim() || undefined,
        gst_rate: txGstRate,
        gst_treatment: txGstTreatment,
        payment_account_code: txPaymentAccount,
        branch_id: txBranchId || undefined
      });

      if (response.journal_entry) {
        setTxSuccessMessage(`Successfully posted: ${response.journal_entry.entry_number} (${response.journal_entry.narration})`);
        // Reset form inputs (except date/account/treatment/rate for productivity)
        setTxDescription("");
        setTxAmount("");
        setTxCounterparty("");
      } else if (response.draft) {
        if (response.draft.status === "exception") {
          setApiError(`Unbalanced or invalid transaction. Sent to exceptions: ${response.draft.exception_reason}`);
        } else {
          setTxSuccessMessage("Draft created, but did not auto-post.");
        }
      }
      // Reload workspace data
      await loadCompanyData(selectedCompanyId);
    } catch (err: any) {
      setApiError(err.message || "Error posting transaction");
    } finally {
      setIsSubmittingTx(false);
    }
  };

  // Handle File Ingestion
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId || !selectedFile) return;

    setIsUploading(true);
    setApiError(null);
    setTxSuccessMessage(null);
    setUploadResult(null);

    try {
      const response = await api.uploadTransactions(selectedCompanyId, selectedFile);
      setUploadResult({
        total_rows: response.total_rows,
        posted_count: response.posted_count,
        exception_count: response.exception_count
      });
      setTxSuccessMessage(`Successfully processed: ${response.total_rows} rows from ${response.filename}`);
      setSelectedFile(null);
      // Reload workspace data
      await loadCompanyData(selectedCompanyId);
    } catch (err: any) {
      setApiError(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };
 
  // Handle Reset Company Data
  const handleResetCompanyData = async () => {
    if (!selectedCompanyId) return;
    if (!window.confirm("Are you sure you want to permanently delete all transactions, drafts, journals, and reports in this workspace? This cannot be undone.")) return;

    try {
      const res = await api.resetCompanyData(selectedCompanyId);
      setTxSuccessMessage(res.message || "Workspace successfully reset.");
      setApiError(null);
      await loadCompanyData(selectedCompanyId, filterStartDate, filterEndDate);
    } catch (err: any) {
      setApiError(err.message || "Failed to reset company data.");
    }
  };

  // --- AI-POWERED COMMERCE OPERATING SYSTEM HELPERS ---

  // 1. AI Workspace Chat
  const handleSendChat = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = customPrompt || chatPrompt;
    if (!promptToSend.trim() || !selectedCompanyId) return;

    // Append user message
    setChatHistory((prev) => [...prev, { sender: "user", text: promptToSend }]);
    if (!customPrompt) setChatPrompt("");
    setIsChatLoading(true);
    setApiError(null);

    try {
      const res = await api.sendChatPrompt(selectedCompanyId, promptToSend);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          text: res.response,
          recommendations: res.recommendations,
          tasks: res.tasks,
          automations: res.automations
        }
      ]);
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "ai", text: `Error: ${err.message || "Failed to communicate with AI workspace."}` }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 2. Toggle AI Agents
  const handleToggleAgent = async (agentId: string, currentEnabled: boolean) => {
    if (!selectedCompanyId) return;
    try {
      const updated = await api.toggleAgent(selectedCompanyId, agentId, !currentEnabled);
      setAgents((prev) =>
        prev.map((a) => (a.id === agentId ? { ...a, is_enabled: updated.is_enabled } : a))
      );
      setTxSuccessMessage(`Agent status updated: ${updated.name} is now ${updated.is_enabled ? "Active" : "Disabled"}`);
      setApiError(null);
    } catch (err: any) {
      setApiError(err.message || "Failed to update agent status");
    }
  };

  // 3. Digital Twin Simulation
  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;
    setIsSimulating(true);
    setApiError(null);
    try {
      const res = await api.runSimulation(selectedCompanyId, {
        name: simName,
        capital_change: simCapital,
        price_change_percent: simPriceChange,
        marketing_spend: simMarketing,
        hiring_count: simHiring
      });
      setSimResult(res);
      setTxSuccessMessage("Scenario projection completed successfully.");
      const updatedScenarios = await api.getSimulationScenarios(selectedCompanyId).catch(() => [] as SimulationScenario[]);
      setScenarios(updatedScenarios);
    } catch (err: any) {
      setApiError(err.message || "Failed to execute scenario projection");
    } finally {
      setIsSimulating(false);
    }
  };

  // 4. Execute Tasks generated from Chat
  const handleExecuteTask = (taskDesc: string) => {
    setChatHistory((prev) =>
      prev.map((msg) => {
        if (msg.tasks) {
          return {
            ...msg,
            tasks: msg.tasks.map((t) =>
              t.description === taskDesc ? { ...t, status: "executed" } : t
            )
          };
        }
        return msg;
      })
    );
    setTxSuccessMessage(`Action executed: "${taskDesc}"`);
  };

  // 5. Toggle Workflow status
  const handleToggleWorkflow = async (workflow: Workflow) => {
    if (!selectedCompanyId) return;
    try {
      const updated = await api.saveWorkflow(selectedCompanyId, {
        name: workflow.name,
        trigger_event: workflow.trigger_event,
        nodes_json: workflow.nodes_json,
        is_active: !workflow.is_active
      });
      setWorkflows((prev) =>
        prev.map((w) => (w.id === workflow.id ? { ...w, is_active: updated.is_active } : w))
      );
      if (selectedWorkflow?.id === workflow.id) {
        setSelectedWorkflow({ ...selectedWorkflow, is_active: updated.is_active });
      }
      setTxSuccessMessage(`Workflow status updated: ${updated.name} is now ${updated.is_active ? "Active" : "Disabled"}`);
      setApiError(null);
    } catch (err: any) {
      setApiError(err.message || "Failed to update workflow");
    }
  };

  // 6. Add node to visual canvas
  const handleAddCanvasNode = async (type: "trigger" | "agent" | "action" | "notify", label: string) => {
    if (!selectedWorkflow || !selectedCompanyId) return;
    const newNodes = [
      ...workflowNodes,
      {
        id: (workflowNodes.length + 1).toString(),
        type,
        label,
        x: 100 + workflowNodes.length * 150,
        y: 150
      }
    ];
    setWorkflowNodes(newNodes);
    try {
      const updated = await api.saveWorkflow(selectedCompanyId, {
        name: selectedWorkflow.name,
        trigger_event: selectedWorkflow.trigger_event,
        nodes_json: JSON.stringify(newNodes),
        is_active: selectedWorkflow.is_active
      });
      setWorkflows((prev) =>
        prev.map((w) => (w.id === selectedWorkflow.id ? { ...w, nodes_json: updated.nodes_json } : w))
      );
      setTxSuccessMessage(`Workflow saved with new node: ${label}`);
      setApiError(null);
    } catch (err: any) {
      setApiError(err.message || "Failed to save workflow node");
    }
  };


  const getFlowIcon = (flow: string) => {
    switch (flow) {
      case "sale":
      case "income":
      case "owner_contribution":
      case "loan_received":
        return <ArrowDownLeft className="text-green-600" size={16} style={{ color: "var(--green)" }} />;
      default:
        return <ArrowUpRight className="text-rose-600" size={16} style={{ color: "var(--rose)" }} />;
    }
  };

  return (
    <div className="app-shell">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Building2 size={22} />
          </div>
          <div>
            <h1>Sudarshan</h1>
            <p>Deterministic Commerce MVP</p>
          </div>
        </div>

        {/* Company Switcher */}
        <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "11px", textTransform: "uppercase", color: "#94a3b8", fontWeight: 700 }}>
            Active Company
          </label>
          {isLoadingCompanies ? (
            <div style={{ fontSize: "13px", color: "#94a3b8" }}>Loading companies...</div>
          ) : (
            <div style={{ display: "flex", gap: "6px" }}>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  background: "#1f2937",
                  border: "1px solid #374151",
                  color: "#ffffff",
                  fontSize: "13px",
                  outline: "none",
                  minWidth: "0"
                }}
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowCompanyForm(true)}
                title="Create or Unlock Company"
                style={{
                  background: "#1f2937",
                  border: "1px solid #374151",
                  color: "#ffffff",
                  borderRadius: "6px",
                  padding: "8px 10px",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer"
                }}
              >
                <PlusCircle size={16} />
              </button>
              {selectedCompanyId && (
                <button
                  onClick={async () => {
                    if (confirm("Are you sure you want to lock and remove this company from this browser?")) {
                      try {
                        const unlocked = JSON.parse(localStorage.getItem("sudarshan_unlocked_companies") || "{}");
                        delete unlocked[selectedCompanyId];
                        localStorage.setItem("sudarshan_unlocked_companies", JSON.stringify(unlocked));
                        setSelectedCompanyId("");
                        await loadCompanies(true);
                      } catch (e) {
                        console.error(e);
                      }
                    }
                  }}
                  title="Lock Company"
                  style={{
                    background: "#1f2937",
                    border: "1px solid #ef4444",
                    color: "#ef4444",
                    borderRadius: "6px",
                    padding: "8px 10px",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer"
                  }}
                >
                  <Lock size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main Nav */}
        <nav className="nav-list" style={{ marginTop: "14px", overflowY: "auto", maxHeight: "calc(100vh - 350px)" }}>
          <label style={{ fontSize: "10px", textTransform: "uppercase", color: "#94a3b8", fontWeight: 700, paddingLeft: "10px", marginTop: "10px", display: "block" }}>
            Operating System
          </label>
          <button
            onClick={() => { setActiveSection("dashboard"); setApiError(null); setTxSuccessMessage(null); }}
            className={`nav-item ${activeSection === "dashboard" ? "active" : ""}`}
          >
            <Compass size={18} />
            <span>Command Center</span>
          </button>

          <button
            disabled={!selectedCompanyId}
            onClick={() => { setActiveSection("workspace"); setApiError(null); setTxSuccessMessage(null); }}
            className={`nav-item ${activeSection === "workspace" ? "active" : ""}`}
          >
            <MessageSquare size={18} />
            <span>AI Workspace</span>
          </button>

          <button
            disabled={!selectedCompanyId}
            onClick={() => { setActiveSection("marketplace"); setApiError(null); setTxSuccessMessage(null); }}
            className={`nav-item ${activeSection === "marketplace" ? "active" : ""}`}
          >
            <Bot size={18} />
            <span>Agent Store</span>
          </button>

          <button
            disabled={!selectedCompanyId}
            onClick={() => { setActiveSection("twin"); setApiError(null); setTxSuccessMessage(null); }}
            className={`nav-item ${activeSection === "twin" ? "active" : ""}`}
          >
            <Brain size={18} />
            <span>Digital Twin</span>
          </button>

          <button
            disabled={!selectedCompanyId}
            onClick={() => { setActiveSection("canvas"); setApiError(null); setTxSuccessMessage(null); }}
            className={`nav-item ${activeSection === "canvas" ? "active" : ""}`}
          >
            <Zap size={18} />
            <span>Automation Studio</span>
          </button>

          <button
            disabled={!selectedCompanyId}
            onClick={() => { setActiveSection("customers"); setApiError(null); setTxSuccessMessage(null); }}
            className={`nav-item ${activeSection === "customers" ? "active" : ""}`}
          >
            <Users size={18} />
            <span>Customer Universe</span>
          </button>

          <button
            disabled={!selectedCompanyId}
            onClick={() => { setActiveSection("warroom"); setApiError(null); setTxSuccessMessage(null); }}
            className={`nav-item ${activeSection === "warroom" ? "active" : ""}`}
          >
            <Activity size={18} />
            <span>Executive War Room</span>
          </button>

          <button
            disabled={!selectedCompanyId}
            onClick={() => { setActiveSection("developer"); setApiError(null); setTxSuccessMessage(null); }}
            className={`nav-item ${activeSection === "developer" ? "active" : ""}`}
          >
            <Code size={18} />
            <span>Developer Portal</span>
          </button>


          <label style={{ fontSize: "10px", textTransform: "uppercase", color: "#94a3b8", fontWeight: 700, paddingLeft: "10px", marginTop: "15px", display: "block" }}>
            Double-Entry Core
          </label>
          <button
            disabled={!selectedCompanyId}
            onClick={() => { setActiveSection("transaction"); setApiError(null); setTxSuccessMessage(null); }}
            className={`nav-item ${activeSection === "transaction" ? "active" : ""}`}
          >
            <PlusCircle size={18} />
            <span>New manual entry</span>
          </button>

          <button
            disabled={!selectedCompanyId}
            onClick={() => { setActiveSection("ledger"); setApiError(null); setTxSuccessMessage(null); }}
            className={`nav-item ${activeSection === "ledger" ? "active" : ""}`}
          >
            <FileText size={18} />
            <span>Journal & Ledgers</span>
          </button>

          <button
            disabled={!selectedCompanyId}
            onClick={() => { setActiveSection("reports"); setApiError(null); setTxSuccessMessage(null); }}
            className={`nav-item ${activeSection === "reports" ? "active" : ""}`}
          >
            <BarChart3 size={18} />
            <span>Financial Reports</span>
          </button>

          <button
            disabled={!selectedCompanyId}
            onClick={() => { setActiveSection("advisory"); setApiError(null); setTxSuccessMessage(null); }}
            className={`nav-item ${activeSection === "advisory" ? "active" : ""}`}
          >
            <Sparkles size={18} />
            <span>AI Advisory</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        {activeCompany && (
          <div className="sidebar-footer" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div>
              <div style={{ fontWeight: 800, color: "#ffffff", fontSize: "14px" }}>{activeCompany.name}</div>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                GSTIN: {activeCompany.gstin || "N/A"}
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                FY: {activeCompany.financial_year_start} to {activeCompany.financial_year_end}
              </div>
            </div>
            <button
              onClick={handleResetCompanyData}
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "6px",
                background: "rgba(225, 29, 72, 0.15)",
                border: "1px solid rgba(225, 29, 72, 0.3)",
                color: "#fda4af",
                fontSize: "11px",
                cursor: "pointer",
                fontWeight: 600,
                textAlign: "center",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "rgba(225, 29, 72, 0.3)"}
              onMouseOut={(e) => e.currentTarget.style.background = "rgba(225, 29, 72, 0.15)"}
            >
              Reset Workspace
            </button>
          </div>
        )}
      </aside>

      {/* MAIN CONTAINER */}
      <main className="main">
        {/* Topbar Banner */}
        <div className="topbar">
          <div>
            <div className="eyebrow">Commerce Engine Boundary</div>
            <h2>
              {activeSection === "dashboard" && "Founder Command Center"}
              {activeSection === "workspace" && "AI Workspace Chat"}
              {activeSection === "marketplace" && "AI Agent Marketplace"}
              {activeSection === "twin" && "Commerce Digital Twin"}
              {activeSection === "canvas" && "Automation Studio Canvas"}
              {activeSection === "customers" && "Customer Universe Intelligence"}
              {activeSection === "warroom" && "Executive War Room"}
              {activeSection === "transaction" && "New Manual Entry"}
              {activeSection === "ledger" && "Journal & Auditable Ledger"}
              {activeSection === "reports" && "Indian Standard Accounting Reports"}
              {activeSection === "advisory" && "AI Management Commentary"}
              {activeSection === "developer" && "Developer Portal & Integration Hub"}
            </h2>
            <p>
              {activeSection === "dashboard" && "Jarvis-style anomaly alerts and automated decision recommendations computed in your general ledger."}
              {activeSection === "workspace" && "Interact with your business using natural language prompts. Assign workflows and generate tactical strategies."}
              {activeSection === "marketplace" && "Enable, disable, and configure specialized agents to handle finance, audit, marketing, and warehousing."}
              {activeSection === "twin" && "Run isolated what-if scenario simulations to project the cash flow and profit impact of financial plans."}
              {activeSection === "canvas" && "Configure triggers, routing agents, and automatic action workflows in a visual Zapier-style canvas."}
              {activeSection === "customers" && "Track customer demographics, behavior analytics, lifetime value (LTV) forecasts, and risk scores."}
              {activeSection === "warroom" && "Strategic overview of aggregate capital levels, key financial balances, conversion analytics, and AI risk statements."}
              {activeSection === "transaction" && "Enter a new purchase, sale, expense, or receipt. The double-entry rules will automatically compile balanced ledger entries."}
              {activeSection === "ledger" && "Balanced ledger lines stored in the core database after passing deterministic double-entry checks."}
              {activeSection === "reports" && "Trial Balance, Profit & Loss, Balance Sheet, and GST reconciliation summaries generated directly from ledger postings."}
              {activeSection === "advisory" && "Management explanations, anomaly alerts, business commentary, and strategic advice generated based on financial results."}
              {activeSection === "developer" && "Manage API keys, inspect real-time webhook delivery logs, and download SDK boilerplates for third-party agents."}
            </p>

          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {selectedCompanyId && branches.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginRight: "10px" }}>
                <span style={{ fontSize: "12px", color: "var(--teal-ink)", opacity: 0.8 }}>Branch:</span>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "4px",
                    border: "1px solid var(--border-color)",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "var(--text-color)",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >
                  <option value="all" style={{ background: "var(--bg-card)" }}>Consolidated (All Branches)</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} style={{ background: "var(--bg-card)" }}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="api-pill" style={{ cursor: "pointer" }} onClick={() => setShowApiSettings(!showApiSettings)}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: selectedCompanyId ? "#10b981" : "#ef4444"
                }}
              ></span>
              <span>{selectedCompanyId ? "API Online" : "Disconnected"}</span>
            </div>
            <button 
              onClick={() => setShowApiSettings(!showApiSettings)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--teal-ink)",
                opacity: 0.7,
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                borderRadius: "4px"
              }}
              title="API Server Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* API Server Settings Panel */}
        {showApiSettings && (
          <div className="panel" style={{ marginBottom: "20px", padding: "16px", border: "1px solid var(--border-color)", background: "var(--bg-card)" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px", color: "var(--teal-ink)" }}>
              <Globe size={18} /> API Server Settings
            </h3>
            <p style={{ fontSize: "12px", color: "var(--teal-ink)", opacity: 0.8, marginBottom: "12px" }}>
              Configure the backend API URL. If you deployed your backend on Render.com under a custom name, enter its URL here.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={tempApiUrl}
                onChange={(e) => setTempApiUrl(e.target.value)}
                placeholder="https://your-api.onrender.com"
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: "1px solid var(--border-color)",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "var(--text-color)"
                }}
              />
              <button
                className="button-primary"
                onClick={() => {
                  localStorage.setItem("sudarshan_api_url", tempApiUrl);
                  setShowApiSettings(false);
                  window.location.reload();
                }}
                style={{ padding: "8px 16px" }}
              >
                Save & Reload
              </button>
              <button
                className="button-secondary"
                onClick={() => {
                  localStorage.removeItem("sudarshan_api_url");
                  setTempApiUrl("https://sudarshan-api.onrender.com");
                  setShowApiSettings(false);
                  window.location.reload();
                }}
                style={{ padding: "8px 16px" }}
              >
                Reset Default
              </button>
            </div>
          </div>
        )}

        {/* ERROR / SUCCESS DISPLAYS */}
        {apiError && (
          <div className="message error" style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
            <AlertCircle size={20} />
            <div>{apiError}</div>
          </div>
        )}

        {txSuccessMessage && (
          <div className="message" style={{ borderLeft: "4px solid var(--green)", background: "rgba(16, 185, 129, 0.1)", color: "var(--teal-ink)", marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
            <CheckCircle2 size={20} style={{ color: "var(--green)" }} />
            <div>{txSuccessMessage}</div>
          </div>
        )}

        {/* ONBOARDING: WELCOME / UNLOCK / CREATE COMPANY FORM */}
        {showCompanyForm && (
          <div className="panel" style={{ maxWidth: "600px", margin: "0 auto 40px" }}>
            <div className="panel-header" style={{ borderBottom: "1px solid var(--line)" }}>
              <div className="panel-title">
                <Building2 size={24} style={{ color: "var(--teal)" }} />
                <div>
                  <h3>Sudarshan AI Commerce OS</h3>
                  <p>Open an existing secure vault or initialize a new company profile.</p>
                </div>
              </div>
            </div>
            
            {/* Tabs for switching mode */}
            <div style={{ display: "flex", gap: "10px", padding: "16px 20px 0", borderBottom: "1px solid var(--line)" }}>
              <button 
                type="button" 
                className={`nav-item ${onboardingMode === "unlock" ? "active" : ""}`}
                style={{ padding: "8px 16px", borderBottom: onboardingMode === "unlock" ? "2px solid var(--teal)" : "none", background: "none", color: onboardingMode === "unlock" ? "var(--ink)" : "var(--muted)", fontWeight: 600, cursor: "pointer" }}
                onClick={() => { setOnboardingMode("unlock"); setApiError(null); }}
              >
                Unlock Existing Company
              </button>
              <button 
                type="button" 
                className={`nav-item ${onboardingMode === "create" ? "active" : ""}`}
                style={{ padding: "8px 16px", borderBottom: onboardingMode === "create" ? "2px solid var(--teal)" : "none", background: "none", color: onboardingMode === "create" ? "var(--ink)" : "var(--muted)", fontWeight: 600, cursor: "pointer" }}
                onClick={() => { setOnboardingMode("create"); setApiError(null); }}
              >
                Setup New Company
              </button>
            </div>

            <div className="panel-body" style={{ padding: "24px 20px" }}>
              {onboardingMode === "unlock" ? (
                /* UNLOCK EXISTING COMPANY FORM */
                <form onSubmit={handleUnlockCompany} className="form-grid" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="field">
                    <label htmlFor="companyName">Company Name *</label>
                    <input
                      type="text"
                      id="companyName"
                      required
                      placeholder="e.g. Sudarshan Enterprises Private Limited"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="companyPassword">Vault Password *</label>
                    <input
                      type="password"
                      id="companyPassword"
                      required
                      placeholder="Enter company password to unlock"
                      value={companyPassword}
                      onChange={(e) => setCompanyPassword(e.target.value)}
                    />
                  </div>
                  <div className="button-row" style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                    <button type="submit" className="btn primary" disabled={isSubmittingCompany}>
                      {isSubmittingCompany ? "Unlocking..." : "Unlock Vault & Load Dashboard"}
                    </button>
                    {companies.length > 0 && (
                      <button type="button" className="btn" onClick={() => setShowCompanyForm(false)}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                /* CREATE NEW COMPANY FORM */
                <form onSubmit={handleCreateCompany} className="form-grid" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="field">
                    <label htmlFor="companyName">Company Name *</label>
                    <input
                      type="text"
                      id="companyName"
                      required
                      placeholder="e.g. Sudarshan Enterprises Private Limited"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="companyGstin">GSTIN (Optional)</label>
                    <input
                      type="text"
                      id="companyGstin"
                      placeholder="e.g. 27AAAAA1111A1Z1 (15-character format)"
                      value={companyGstin}
                      onChange={(e) => setCompanyGstin(e.target.value)}
                    />
                  </div>
                  <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="field">
                      <label htmlFor="fyStart">Financial Year Start *</label>
                      <input
                        type="date"
                        id="fyStart"
                        required
                        value={fyStart}
                        onChange={(e) => setFyStart(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="fyEnd">Financial Year End *</label>
                      <input
                        type="date"
                        id="fyEnd"
                        required
                        value={fyEnd}
                        onChange={(e) => setFyEnd(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="companyPassword">Vault Password *</label>
                    <input
                      type="password"
                      id="companyPassword"
                      required
                      placeholder="Set a password for this company's vault (min 4 chars)"
                      value={companyPassword}
                      onChange={(e) => setCompanyPassword(e.target.value)}
                    />
                  </div>
                  <div className="button-row" style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                    <button type="submit" className="btn primary" disabled={isSubmittingCompany}>
                      {isSubmittingCompany ? "Creating..." : "Create & Initialize Seed Data"}
                    </button>
                    {companies.length > 0 && (
                      <button type="button" className="btn" onClick={() => setShowCompanyForm(false)}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

{/* PAYWALL / SUBSCRIPTION CHECK */}
{activeCompany && isLocked ? (
  <div className="panel glass" style={{
    margin: "40px auto",
    maxWidth: "600px",
    padding: "40px",
    textAlign: "center",
    backdropFilter: "blur(12px)",
    background: "rgba(13, 18, 30, 0.45)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px"
  }}>
    <div style={{
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      background: "rgba(13, 148, 136, 0.1)",
      border: "2px solid var(--teal)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--teal)",
      boxShadow: "0 0 20px rgba(13, 148, 136, 0.2)"
    }}>
      <Lock size={40} />
    </div>
    
    <div>
      <h2 style={{ fontSize: "24px", color: "#ffffff", fontWeight: 800, marginBottom: "8px" }}>
        Premium Subscription Required
      </h2>
      <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: "1.6", maxWidth: "400px", margin: "0 auto" }}>
        Your 7-day free trial for <strong>{activeCompany.name}</strong> has expired. 
        Subscribe to Sudarshan AI Commerce OS to unlock unlimited bookkeeping automation, AI agents, and reports.
      </p>
    </div>

    <div style={{
      background: "rgba(255, 255, 255, 0.02)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      borderRadius: "12px",
      padding: "20px",
      width: "100%",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
      textAlign: "left"
    }}>
      <div>
        <div style={{ fontSize: "12px", color: "var(--muted)" }}>Plan Duration</div>
        <div style={{ fontWeight: 700, color: "#ffffff", fontSize: "16px", marginTop: "4px" }}>Monthly recurring</div>
      </div>
      <div style={{ borderLeft: "1px solid rgba(255, 255, 255, 0.1)", paddingLeft: "16px" }}>
        <div style={{ fontSize: "12px", color: "var(--muted)" }}>Pricing</div>
        <div style={{ fontWeight: 700, color: "var(--teal)", fontSize: "20px", marginTop: "2px" }}>₹999 <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 400 }}>/ month</span></div>
      </div>
    </div>

    <button
      onClick={handleCheckout}
      disabled={isSubscribing}
      className="btn primary"
      style={{
        width: "100%",
        padding: "14px",
        fontSize: "16px",
        fontWeight: 700,
        borderRadius: "10px",
        background: "var(--teal)",
        border: "none",
        color: "#ffffff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        boxShadow: "0 4px 14px rgba(13, 148, 136, 0.3)"
      }}
    >
      {isSubscribing ? (
        <>
          <RefreshCw size={18} className="spin" />
          <span>Processing Checkout...</span>
        </>
      ) : (
        <>
          <CreditCard size={18} />
          <span>Subscribe Now (₹999/month)</span>
        </>
      )}
    </button>
    
    <div style={{ fontSize: "12px", color: "var(--muted)" }}>
      Secure payments processed by Razorpay. Test mode enabled.
    </div>
  </div>
) : (
  <>
    {/* SECTION 1: DASHBOARD (FOUNDER COMMAND CENTER) */}
    {activeSection === "dashboard" && activeCompany && (
      <div className="grid" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Quick Greeting */}
        <div className="panel glass" style={{ borderLeft: "4px solid var(--purple)" }}>
          <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--ink)" }}>Good Morning, Nischay! 👋</h3>
          <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "0.85rem" }}>
            Here's a strategic summary of your store metrics and real-time AI risk analysis.
          </p>
        </div>

            {/* Quick Metrics */}
            <div className="grid metrics" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              <div className="panel metric">
                <span>Total Revenue</span>
                <strong>₹ {execSummary ? parseFloat(execSummary.revenue).toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "1,24,580"}</strong>
                <small style={{ color: "var(--green)" }}>{execSummary?.revenue_growth || "↑ 18.6%"} vs last month</small>
              </div>
              <div className="panel metric">
                <span>Active Orders</span>
                <strong>{journals.length > 0 ? journals.length : "1,429"}</strong>
                <small style={{ color: "var(--green)" }}>↑ 12.4% vs last period</small>
              </div>
              <div className="panel metric">
                <span>Active Customers</span>
                <strong>{execSummary?.active_loyalty_users || "892"}</strong>
                <small style={{ color: "var(--green)" }}>↑ 8.3% loyalty enrollment</small>
              </div>
              <div className="panel metric">
                <span>Conversion Rate</span>
                <strong>{execSummary?.conversion_rate || "3.89%"}</strong>
                <small style={{ color: "var(--green)" }}>↑ 15.7% overall funnel</small>
              </div>
            </div>

            {/* Core split section */}
            <div className="grid workspace" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "20px" }}>
              {/* Left Column: Alerts and Anomalies */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <AlertTriangle size={18} style={{ color: "var(--amber)" }} />
                      <div>
                        <h3>AI Anomaly Alerts</h3>
                        <p>Real-time threats, leakage detections, and dynamic opportunities.</p>
                      </div>
                    </div>
                  </div>
                  <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {alerts.length === 0 ? (
                      <div style={{ textAlign: "center", color: "var(--muted)", padding: "20px" }}>
                        No alerts detected. Your operating system is running optimally.
                      </div>
                    ) : (
                      alerts.map((alert) => (
                        <div
                          key={alert.id}
                          style={{
                            padding: "16px",
                            borderRadius: "8px",
                            background: alert.severity === "critical" || alert.severity === "high"
                              ? "rgba(244, 63, 94, 0.08)"
                              : "rgba(245, 158, 11, 0.08)",
                            border: `1px solid ${alert.severity === "critical" || alert.severity === "high" ? "rgba(244, 63, 94, 0.2)" : "rgba(245, 158, 11, 0.2)"}`,
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong style={{
                              color: alert.severity === "critical" || alert.severity === "high" ? "var(--rose)" : "var(--amber)",
                              textTransform: "uppercase",
                              fontSize: "11px",
                              letterSpacing: "1px"
                            }}>
                              {alert.severity} Severity Alert
                            </strong>
                            <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                              {new Date(alert.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 style={{ margin: 0, fontSize: "14px", color: "var(--ink)" }}>{alert.title}</h4>
                          <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)" }}>{alert.description}</p>
                          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                            {alert.type === "inventory_low" && (
                              <button onClick={() => setActiveSection("canvas")} className="btn primary small" style={{ padding: "4px 8px", fontSize: "11px" }}>
                                Open Replenish Workflow
                              </button>
                            )}
                            {alert.type === "revenue_risk" && (
                              <button onClick={() => { setActiveSection("workspace"); handleSendChat(undefined, "How should I mitigate competitor pricing risk?"); }} className="btn primary small" style={{ padding: "4px 8px", fontSize: "11px" }}>
                                Ask AI Workspace
                              </button>
                            )}
                            {alert.type === "competitor_price" && (
                              <button onClick={() => { setActiveSection("twin"); setSimPriceChange(7.8); }} className="btn primary small" style={{ padding: "4px 8px", fontSize: "11px" }}>
                                Simulate Price Hike
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Jarvis Recommendations Log */}
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <Sparkles size={18} style={{ color: "var(--purple)" }} />
                      <div>
                        <h3>Jarvis Recommendations</h3>
                        <p>Tactical suggestions computed directly from financial reports.</p>
                      </div>
                    </div>
                  </div>
                  <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ padding: "10px", borderLeft: "3px solid var(--purple)", background: "rgba(168, 85, 247, 0.05)", fontSize: "13px" }}>
                      <strong>CFO Agent says:</strong> "Inventory optimization could free up ₹85,000 in working capital. Delaying bulk purchase of Coffee Maker is advised."
                    </div>
                    <div style={{ padding: "10px", borderLeft: "3px solid var(--teal)", background: "rgba(20, 184, 166, 0.05)", fontSize: "13px" }}>
                      <strong>Tax Agent says:</strong> "Input tax credit (ITC) reconciliation shows positive matches across 98% of vendor invoices. Ready for filing."
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Ledger Integrity Check & Quick Stats */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <CheckCircle2 size={18} style={{ color: "var(--teal)" }} />
                      <div>
                        <h3>Ledger Integrity Check</h3>
                        <p>Deterministic checks run in database sandbox.</p>
                      </div>
                    </div>
                  </div>
                  <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid var(--line)" }}>
                      <span>Trial Balance Balanced:</span>
                      <span className={`status ${trialBalance?.is_balanced ? "good" : "bad"}`}>
                        {trialBalance?.is_balanced ? "Balanced" : "Unbalanced"}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid var(--line)" }}>
                      <span>Balance Sheet Balanced:</span>
                      <span className={`status ${balanceSheet?.balanced ? "good" : "bad"}`}>
                        {balanceSheet?.balanced ? "Balanced" : "Unbalanced"}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid var(--line)" }}>
                      <span>Exception Queue:</span>
                      <span className={`status ${drafts.filter(d => d.status === "exception").length > 0 ? "bad" : "good"}`}>
                        {drafts.filter(d => d.status === "exception").length} items
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Active AI Agents:</span>
                      <span style={{ fontWeight: 800 }}>{agents.filter(a => a.is_enabled).length} enabled</span>
                    </div>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <Sliders size={18} style={{ color: "var(--blue)" }} />
                      <div>
                        <h3>Quick Actions</h3>
                        <p>Manage workspace data.</p>
                      </div>
                    </div>
                  </div>
                  <div className="panel-body" style={{ display: "grid", gap: "10px" }}>
                    <button onClick={() => setActiveSection("workspace")} className="btn primary" style={{ width: "100%" }}>
                      <MessageSquare size={14} /> Open AI Chat
                    </button>
                    <button onClick={() => loadCompanyData(selectedCompanyId)} className="btn" style={{ width: "100%" }}>
                      <RefreshCw size={14} /> Reload Workspace
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: AI WORKSPACE */}
        {activeSection === "workspace" && activeCompany && (
          <div className="grid workspace" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px" }}>
            {/* Left Column: Chat log */}
            <div className="panel" style={{ display: "flex", flexDirection: "column", minHeight: "550px" }}>
              <div className="panel-header">
                <div className="panel-title">
                  <Bot size={20} style={{ color: "var(--purple)" }} />
                  <div>
                    <h3>AI CEO/CFO Assistant</h3>
                    <p>Natural language interface connected to inventory, marketing, and reports.</p>
                  </div>
                </div>
              </div>
              <div className="panel-body" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                {/* Chat window */}
                <div style={{
                  flex: 1,
                  maxHeight: "350px",
                  overflowY: "auto",
                  border: "1px solid var(--line)",
                  borderRadius: "8px",
                  padding: "16px",
                  background: "#080c14",
                  marginBottom: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}>
                  {chatHistory.map((chat, idx) => (
                    <div
                      key={idx}
                      style={{
                        alignSelf: chat.sender === "user" ? "flex-end" : "flex-start",
                        background: chat.sender === "user" ? "var(--purple)" : "var(--surface-2)",
                        color: "white",
                        padding: "10px 14px",
                        borderRadius: "12px",
                        maxWidth: "80%",
                        fontSize: "13px"
                      }}
                    >
                      <div>{chat.text}</div>
                      {chat.recommendations && chat.recommendations.length > 0 && (
                        <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "4px" }}>
                          <strong style={{ fontSize: "11px", color: "var(--teal)" }}>Recommendations:</strong>
                          {chat.recommendations.map((rec, rIdx) => (
                            <div key={rIdx} style={{ fontSize: "12px" }}>• {rec}</div>
                          ))}
                        </div>
                      )}
                      {chat.tasks && chat.tasks.length > 0 && (
                        <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                          <strong style={{ fontSize: "11px", color: "var(--amber)" }}>Proposed Actions (Confirm Below):</strong>
                          {chat.tasks.map((t, tIdx) => (
                            <div key={tIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)", padding: "6px", borderRadius: "4px" }}>
                              <span style={{ fontSize: "12px" }}>{t.description}</span>
                              {t.status === "pending" ? (
                                <button
                                  type="button"
                                  onClick={() => handleExecuteTask(t.description)}
                                  className="btn primary small"
                                  style={{ padding: "2px 6px", fontSize: "10px", background: "var(--green)" }}
                                >
                                  Execute
                                </button>
                              ) : (
                                <span style={{ fontSize: "10px", color: "var(--green)", fontWeight: "bold" }}>Executed</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {isChatLoading && (
                    <div style={{ alignSelf: "flex-start", color: "var(--muted)", fontSize: "13px" }}>AI is compiling metrics...</div>
                  )}
                </div>

                {/* Input and quick suggestions */}
                <form onSubmit={handleSendChat} style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={chatPrompt}
                    onChange={(e) => setChatPrompt(e.target.value)}
                    placeholder="Ask about inventory, pricing, or ask to 'Increase revenue'..."
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "8px",
                      background: "var(--surface-2)",
                      border: "1px solid var(--line)",
                      color: "white",
                      outline: "none"
                    }}
                  />
                  <button type="submit" className="btn glow-btn" disabled={isChatLoading}>
                    Ask AI
                  </button>
                </form>

                <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                  <button type="button" onClick={() => handleSendChat(undefined, "How can we increase revenue next month?")} className="btn small" style={{ fontSize: "11px" }}>
                    "Increase revenue"
                  </button>
                  <button type="button" onClick={() => handleSendChat(undefined, "Analyze my inventory levels")} className="btn small" style={{ fontSize: "11px" }}>
                    "Analyze inventory"
                  </button>
                  <button type="button" onClick={() => handleSendChat(undefined, "Show active automations")} className="btn small" style={{ fontSize: "11px" }}>
                    "Show automations"
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: AI Strategy Workspace */}
            <div className="panel" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="panel-header">
                <div className="panel-title">
                  <Sparkles size={20} style={{ color: "var(--purple)" }} />
                  <div>
                    <h3>Strategy Workspace</h3>
                    <p>Live recommendations and tasks extracted from conversation.</p>
                  </div>
                </div>
              </div>
              <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h4 style={{ margin: "0 0 8px", fontSize: "13px", color: "var(--muted)", textTransform: "uppercase" }}>Recommended Tactics</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {chatHistory.filter(c => c.sender === "ai" && c.recommendations).length === 0 ? (
                      <div style={{ fontSize: "13px", color: "var(--muted)" }}>No recommendations compiled yet. Submit a prompt to start.</div>
                    ) : (
                      chatHistory.filter(c => c.sender === "ai" && c.recommendations).slice(-1)[0].recommendations?.map((rec, idx) => (
                        <div key={idx} style={{ padding: "10px", background: "rgba(168, 85, 247, 0.05)", borderLeft: "3px solid var(--purple)", borderRadius: "4px", fontSize: "13px" }}>
                          {rec}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: "0 0 8px", fontSize: "13px", color: "var(--muted)", textTransform: "uppercase" }}>Pending Actions</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {chatHistory.filter(c => c.sender === "ai" && c.tasks).length === 0 ? (
                      <div style={{ fontSize: "13px", color: "var(--muted)" }}>No actions triggered.</div>
                    ) : (
                      chatHistory.filter(c => c.sender === "ai" && c.tasks).slice(-1)[0].tasks?.map((t, idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "var(--surface-2)", borderRadius: "6px", fontSize: "13px" }}>
                          <span>{t.description}</span>
                          <span style={{ fontWeight: "bold", color: t.status === "executed" ? "var(--green)" : "var(--amber)" }}>
                            {t.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: AI AGENT MARKETPLACE */}
        {activeSection === "marketplace" && activeCompany && (
          <div className="grid" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="panel glass" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Specialized AI Agent Marketplace</h3>
                <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "0.85rem" }}>
                  Enable platform co-pilots or install third-party developer solutions for accounting, tax, analytics, and CRM.
                </p>
              </div>
              <div style={{ display: "flex", gap: "6px", background: "rgba(255,255,255,0.05)", padding: "4px", borderRadius: "8px" }}>
                <button
                  onClick={() => setMarketTab("platform")}
                  className={`btn ${marketTab === "platform" ? "primary" : "text"}`}
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                >
                  Core Platform Agents
                </button>
                <button
                  onClick={() => setMarketTab("thirdparty")}
                  className={`btn ${marketTab === "thirdparty" ? "primary" : "text"}`}
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                >
                  Third-Party Store
                </button>
              </div>
            </div>

            {marketTab === "platform" && (
              <div className="grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                {agents.map((agent) => (
                  <div key={agent.id} className="panel" style={{ borderTop: `4px solid ${agent.is_enabled ? "var(--teal)" : "var(--line)"}` }}>
                    <div className="panel-body" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "180px" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                          <h4 style={{ margin: 0, fontSize: "16px", color: "var(--ink)" }}>{agent.name}</h4>
                          <span className="badge" style={{
                            background: agent.is_enabled ? "rgba(20, 184, 166, 0.15)" : "rgba(255,255,255,0.05)",
                            color: agent.is_enabled ? "var(--teal)" : "var(--muted)",
                            fontSize: "11px",
                            padding: "2px 6px",
                            borderRadius: "4px"
                          }}>
                            {agent.role}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)" }}>{agent.description}</p>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px", paddingTop: "10px", borderTop: "1px solid var(--line)" }}>
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                          Status: <strong style={{ color: agent.is_enabled ? "var(--teal)" : "var(--muted)" }}>{agent.is_enabled ? "Active" : "Disabled"}</strong>
                        </span>
                        <button
                          onClick={() => handleToggleAgent(agent.id, agent.is_enabled)}
                          className={`btn ${agent.is_enabled ? "" : "primary"}`}
                          style={{ padding: "4px 12px", fontSize: "12px" }}
                        >
                          {agent.is_enabled ? "Deactivate" : "Activate Agent"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {marketTab === "thirdparty" && (
              <div style={{ display: "grid", gap: "20px" }}>
                {/* Control bar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, color: "var(--ink)" }}>Third-Party Marketplace Agents</h4>
                  <button
                    onClick={() => setShowPublishForm(true)}
                    className="btn primary"
                    style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "6px 12px" }}
                  >
                    <Plus size={14} />
                    <span>Publish Custom Agent</span>
                  </button>
                </div>

                {/* Publish Form Modal/Panel */}
                {showPublishForm && (
                  <div className="panel" style={{ border: "2px solid var(--teal)" }}>
                    <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div className="panel-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Plus size={18} style={{ color: "var(--teal)" }} />
                        <h3>Publish Agent to Marketplace</h3>
                      </div>
                      <button onClick={() => setShowPublishForm(false)} className="btn text" style={{ padding: "4px" }}>Cancel</button>
                    </div>
                    <form onSubmit={handlePublishMarketplaceAgent} className="panel-body form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: 700 }}>Developer / Publisher Name</label>
                        <input type="text" value={publishDevName} onChange={(e) => setPublishDevName(e.target.value)} placeholder="e.g. Acme Corp" required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: 700 }}>Agent Name</label>
                        <input type="text" value={publishAgentName} onChange={(e) => setPublishAgentName(e.target.value)} placeholder="e.g. GST Auto-Filer" required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)" }} />
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: 700 }}>Description & Features</label>
                        <textarea value={publishAgentDesc} onChange={(e) => setPublishAgentDesc(e.target.value)} placeholder="Explain the capabilities, triggers, and logic of this agent." required style={{ width: "100%", height: "80px", borderRadius: "6px", padding: "8px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: 700 }}>Category</label>
                        <select value={publishAgentCat} onChange={(e) => setPublishAgentCat(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--surface-2)", color: "var(--ink)", border: "1px solid var(--line)" }}>
                          <option value="Finance">Finance</option>
                          <option value="Analytics">Analytics</option>
                          <option value="Compliance">Compliance</option>
                          <option value="Utility">Utility</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: 700 }}>Monthly Subscription Cost (₹)</label>
                        <input type="number" value={publishAgentPrice} onChange={(e) => setPublishAgentPrice(e.target.value)} placeholder="49" required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)" }} />
                      </div>
                      <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                        <button type="submit" disabled={isPublishingAgent} className="btn primary" style={{ padding: "8px 16px" }}>
                          {isPublishingAgent ? <RefreshCw size={14} className="spin" /> : "Publish Agent"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Split grid for agents list & details */}
                <div style={{ display: "grid", gridTemplateColumns: selectedAgent ? "1fr 1.2fr" : "1fr", gap: "20px" }}>
                  {/* Agents List */}
                  <div style={{ display: "grid", gridTemplateColumns: selectedAgent ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                    {mAgents.map((agent) => {
                      const isSubscribed = subscribedAgents.includes(agent.id);
                      const avgRating = agent.ratings_count > 0 ? (agent.ratings_sum / agent.ratings_count).toFixed(1) : "N/A";
                      return (
                        <div
                          key={agent.id}
                          onClick={() => setSelectedAgent(agent)}
                          className="panel"
                          style={{
                            cursor: "pointer",
                            border: selectedAgent?.id === agent.id ? "2px solid var(--teal)" : "1px solid var(--line)",
                            background: selectedAgent?.id === agent.id ? "rgba(20, 184, 166, 0.05)" : "var(--surface)",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <div className="panel-body" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "150px" }}>
                            <div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                <div>
                                  <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 800 }}>{agent.name}</h4>
                                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>by {agent.developer_name}</span>
                                </div>
                                <span className="badge" style={{ background: "rgba(255,255,255,0.05)", color: "var(--teal)", fontSize: "10px", padding: "2px 6px" }}>
                                  {agent.category}
                                </span>
                              </div>
                              <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {agent.description}
                              </p>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "8px", borderTop: "1px solid var(--line)", fontSize: "12px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <Star size={12} className="text-amber-500" style={{ color: "var(--amber)", fill: "var(--amber)" }} />
                                <span>{avgRating} ({agent.ratings_count})</span>
                              </div>
                              <div style={{ fontWeight: 800, color: "var(--teal)" }}>
                                ₹{agent.price_monthly}/mo
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Agent Details & Review Section */}
                  {selectedAgent && (
                    <div className="panel" style={{ borderLeft: "4px solid var(--teal)" }}>
                      <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                            {selectedAgent.category} Agent
                          </div>
                          <h3 style={{ margin: "2px 0 0" }}>{selectedAgent.name}</h3>
                          <span style={{ fontSize: "12px", color: "var(--muted)" }}>Developed by {selectedAgent.developer_name}</span>
                        </div>
                        <button onClick={() => setSelectedAgent(null)} className="btn text" style={{ padding: "4px" }}>Close</button>
                      </div>

                      <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div>
                          <h4 style={{ margin: "0 0 6px 0" }}>Description</h4>
                          <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)", lineHeight: "1.6" }}>{selectedAgent.description}</p>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-2)", padding: "12px 16px", borderRadius: "8px" }}>
                          <div>
                            <div style={{ fontSize: "11px", color: "var(--muted)" }}>Monthly Cost</div>
                            <strong style={{ fontSize: "18px", color: "var(--teal)" }}>₹{selectedAgent.price_monthly}</strong>
                          </div>
                          <button
                            onClick={() => handleSubscribeAgent(selectedAgent.id)}
                            className={`btn ${subscribedAgents.includes(selectedAgent.id) ? "" : "primary"}`}
                            style={{ display: "flex", alignItems: "center", gap: "6px" }}
                          >
                            <Settings size={14} />
                            <span>{subscribedAgents.includes(selectedAgent.id) ? "Cancel Subscription" : "Subscribe & Install"}</span>
                          </button>
                        </div>

                        {/* Reviews list */}
                        <div>
                          <h4 style={{ margin: "0 0 10px 0", display: "flex", justifyContent: "space-between" }}>
                            <span>User Reviews ({selectedAgent.ratings_count})</span>
                            <span style={{ fontSize: "12px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                              Average: {(selectedAgent.ratings_sum / (selectedAgent.ratings_count || 1)).toFixed(1)} <Star size={12} style={{ color: "var(--amber)", fill: "var(--amber)" }} />
                            </span>
                          </h4>

                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "180px", overflowY: "auto", marginBottom: "14px" }}>
                            {(() => {
                              let reviews = [];
                              try {
                                reviews = JSON.parse(selectedAgent.reviews_json || "[]");
                              } catch {
                                reviews = [];
                              }
                              return reviews.length === 0 ? (
                                <div style={{ fontSize: "12px", color: "var(--muted)", fontStyle: "italic" }}>No reviews posted yet. Be the first!</div>
                              ) : (
                                reviews.map((rev: any, i: number) => (
                                  <div key={i} style={{ border: "1px solid var(--line)", borderRadius: "6px", padding: "10px", background: "var(--surface-2)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                      <strong style={{ fontSize: "12px" }}>{rev.user}</strong>
                                      <div style={{ display: "flex", gap: "2px" }}>
                                        {Array.from({ length: rev.rating || 5 }).map((_, idx) => (
                                          <Star key={idx} size={10} style={{ color: "var(--amber)", fill: "var(--amber)" }} />
                                        ))}
                                      </div>
                                    </div>
                                    <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>{rev.comment}</p>
                                  </div>
                                ))
                              );
                            })()}
                          </div>

                          {/* Write Review Form */}
                          <form onSubmit={handlePostAgentReview} style={{ borderTop: "1px solid var(--line)", paddingTop: "14px" }}>
                            <h5 style={{ margin: "0 0 8px 0" }}>Write a Review</h5>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                              <div>
                                <label style={{ fontSize: "11px", display: "block", marginBottom: "2px" }}>Your Name</label>
                                <input type="text" value={reviewUser} onChange={(e) => setReviewUser(e.target.value)} placeholder="Alice Smith" required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)" }} />
                              </div>
                              <div>
                                <label style={{ fontSize: "11px", display: "block", marginBottom: "2px" }}>Rating (1-5)</label>
                                <select value={reviewRating} onChange={(e) => setReviewRating(parseInt(e.target.value))} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "var(--surface-2)", color: "var(--ink)", border: "1px solid var(--line)" }}>
                                  <option value="5">5 Stars</option>
                                  <option value="4">4 Stars</option>
                                  <option value="3">3 Stars</option>
                                  <option value="2">2 Stars</option>
                                  <option value="1">1 Star</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label style={{ fontSize: "11px", display: "block", marginBottom: "2px" }}>Comments</label>
                              <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Write your review here..." required style={{ width: "100%", height: "50px", borderRadius: "6px", padding: "6px", border: "1px solid var(--line)", fontSize: "12px", background: "var(--surface)", color: "var(--ink)" }} />
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                              <button type="submit" disabled={isSubmittingReview} className="btn primary" style={{ padding: "4px 12px", fontSize: "12px" }}>
                                {isSubmittingReview ? <RefreshCw size={12} className="spin" /> : "Post Review"}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: COMMERCE DIGITAL TWIN */}
        {activeSection === "twin" && activeCompany && (
          <div className="grid workspace" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "20px" }}>
            {/* Left Column: Input Panel */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <Sliders size={20} style={{ color: "var(--blue)" }} />
                  <div>
                    <h3>Scenario Simulator</h3>
                    <p>Adjust variables to test business performance indicators in the sandbox twin.</p>
                  </div>
                </div>
              </div>
              <div className="panel-body">
                <form onSubmit={handleRunSimulation} className="form-grid" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="field">
                    <label>Scenario Name</label>
                    <input
                      type="text"
                      value={simName}
                      onChange={(e) => setSimName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Capital Injection / Loan Addition (₹)</label>
                    <input
                      type="number"
                      value={simCapital}
                      onChange={(e) => setSimCapital(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="field">
                    <label>Product Price Change (%)</label>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      step="0.5"
                      value={simPriceChange}
                      onChange={(e) => setSimPriceChange(parseFloat(e.target.value))}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--muted)" }}>
                      <span>-20%</span>
                      <strong style={{ color: "var(--purple)" }}>{simPriceChange >= 0 ? "+" : ""}{simPriceChange}%</strong>
                      <span>+20%</span>
                    </div>
                  </div>

                  <div className="field">
                    <label>Additional Marketing Spend (₹)</label>
                    <input
                      type="number"
                      value={simMarketing}
                      onChange={(e) => setSimMarketing(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="field">
                    <label>New Hires Count</label>
                    <select
                      value={simHiring}
                      onChange={(e) => setSimHiring(parseInt(e.target.value) || 0)}
                    >
                      <option value="0">0 Employees</option>
                      <option value="1">1 Employee (+₹50K/mo)</option>
                      <option value="2">2 Employees (+₹100K/mo)</option>
                      <option value="3">3 Employees (+₹150K/mo)</option>
                    </select>
                  </div>

                  <button type="submit" className="btn glow-btn" disabled={isSimulating} style={{ marginTop: "10px" }}>
                    {isSimulating ? "Running Simulation..." : "Simulate Scenario Projections"}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Scenario Results comparison */}
            <div className="panel" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="panel-header">
                <div className="panel-title">
                  <Brain size={20} style={{ color: "var(--purple)" }} />
                  <div>
                    <h3>Digital Twin Projection</h3>
                    <p>Comparison of baseline metrics against the simulated growth scenario.</p>
                  </div>
                </div>
              </div>
              <div className="panel-body">
                {simResult ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div style={{ padding: "16px", borderRadius: "8px", background: "var(--surface-2)" }}>
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}>Projected Revenue</span>
                        <div style={{ fontSize: "20px", fontWeight: 800, marginTop: "4px" }}>
                          ₹ {parseFloat(simResult.projected_revenue).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </div>
                        <small style={{ color: "var(--green)" }}>Projections show expansion</small>
                      </div>

                      <div style={{ padding: "16px", borderRadius: "8px", background: "var(--surface-2)" }}>
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}>Projected Net Profit</span>
                        <div style={{
                          fontSize: "20px",
                          fontWeight: 800,
                          marginTop: "4px",
                          color: parseFloat(simResult.projected_net_profit) >= 0 ? "var(--green)" : "var(--rose)"
                        }}>
                          ₹ {parseFloat(simResult.projected_net_profit).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </div>
                        <small>Simulated net margin</small>
                      </div>

                      <div style={{ padding: "16px", borderRadius: "8px", background: "var(--surface-2)" }}>
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}>Projected Cash Balance</span>
                        <div style={{ fontSize: "20px", fontWeight: 800, marginTop: "4px" }}>
                          ₹ {parseFloat(simResult.projected_cash_balance).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </div>
                        <small>Working capital projection</small>
                      </div>

                      <div style={{ padding: "16px", borderRadius: "8px", background: "var(--surface-2)" }}>
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}>Simulated Marketing ROI</span>
                        <div style={{ fontSize: "20px", fontWeight: 800, marginTop: "4px", color: "var(--teal)" }}>
                          {simResult.roi}x
                        </div>
                        <small>Ad spend ROAS metric</small>
                      </div>
                    </div>

                    <div style={{ padding: "14px", borderRadius: "8px", background: simResult.risk_level === "high" ? "rgba(244, 63, 94, 0.08)" : "rgba(16, 185, 129, 0.08)", border: `1px solid ${simResult.risk_level === "high" ? "var(--rose)" : "var(--green)"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Projected Scenario Risk Index:</span>
                      <strong style={{
                        textTransform: "uppercase",
                        color: simResult.risk_level === "high" ? "var(--rose)" : simResult.risk_level === "medium" ? "var(--amber)" : "var(--green)"
                      }}>
                        {simResult.risk_level} Risk
                      </strong>
                    </div>

                    <div>
                      <h4 style={{ margin: "0 0 10px", fontSize: "13px", color: "var(--muted)" }}>AI Decision Advice</h4>
                      <ul style={{ paddingLeft: "20px", margin: 0, fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        {simResult.advice.map((item, idx) => (
                          <li key={idx} style={{ color: "var(--ink)" }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px" }}>
                    Configure the sliders on the left and click Simulate to generate projections.
                  </div>
                )}
              </div>
            </div>

            {/* Simulation History panel */}
            <div className="panel" style={{ gridColumn: "span 2", marginTop: "10px" }}>
              <div className="panel-header">
                <div className="panel-title">
                  <History size={20} style={{ color: "var(--teal)" }} />
                  <div>
                    <h3>Simulation History</h3>
                    <p>Review and audit past scenario forecasts ran in the sandbox twin.</p>
                  </div>
                </div>
              </div>
              <div className="panel-body">
                {scenarios.length === 0 ? (
                  <div style={{ textAlign: "center", color: "var(--muted)", padding: "20px" }}>
                    No historical simulation records found. Run a simulation to start.
                  </div>
                ) : (
                  <div className="table-wrap" style={{ border: "1px solid var(--line)", borderRadius: "8px" }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Scenario Name</th>
                          <th>Capital Change</th>
                          <th>Price Change</th>
                          <th>Marketing Spend</th>
                          <th>Hiring Count</th>
                          <th>Projected Revenue</th>
                          <th>Projected Net Profit</th>
                          <th>Risk Level</th>
                          <th>Run Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scenarios.map((s) => (
                          <tr key={s.id}>
                            <td style={{ fontWeight: 800 }}>{s.name}</td>
                            <td>₹ {parseFloat(s.params.capital_change?.toString() || "0").toLocaleString("en-IN")}</td>
                            <td style={{ color: (s.params.price_change_percent || 0) >= 0 ? "var(--green)" : "var(--rose)" }}>
                              {(s.params.price_change_percent || 0) >= 0 ? "+" : ""}{s.params.price_change_percent}%
                            </td>
                            <td>₹ {parseFloat(s.params.marketing_spend?.toString() || "0").toLocaleString("en-IN")}</td>
                            <td>{s.params.hiring_count} staff</td>
                            <td style={{ fontWeight: 800 }}>₹ {parseFloat(s.results.projected_revenue || "0").toLocaleString("en-IN")}</td>
                            <td style={{
                              fontWeight: 800,
                              color: parseFloat(s.results.projected_net_profit || "0") >= 0 ? "var(--green)" : "var(--rose)"
                            }}>
                              ₹ {parseFloat(s.results.projected_net_profit || "0").toLocaleString("en-IN")}
                            </td>
                            <td>
                              <span className={`status ${s.results.risk_level === "high" ? "bad" : s.results.risk_level === "medium" ? "warn" : "good"}`}>
                                {s.results.risk_level}
                              </span>
                            </td>
                            <td style={{ fontSize: "12px", color: "var(--muted)" }}>
                              {new Date(s.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: AUTOMATION CANVAS */}
        {activeSection === "canvas" && activeCompany && (
          <div className="grid" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="panel glass" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Automation Studio</h3>
                <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "0.85rem" }}>
                  Design visual workflows to trigger alerts, execute transactions, or route parameters to agents.
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <select
                  value={selectedWorkflow?.id || ""}
                  onChange={(e) => {
                    const w = workflows.find(item => item.id === e.target.value);
                    if (w) {
                      setSelectedWorkflow(w);
                      setWorkflowNodes(JSON.parse(w.nodes_json));
                    }
                  }}
                  style={{ padding: "8px", borderRadius: "6px", background: "var(--surface-2)", color: "white", border: "1px solid var(--line)" }}
                >
                  {workflows.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
                {selectedWorkflow && (
                  <button
                    onClick={() => handleToggleWorkflow(selectedWorkflow)}
                    className={`btn ${selectedWorkflow.is_active ? "" : "primary"}`}
                    style={{ padding: "8px 16px" }}
                  >
                    {selectedWorkflow.is_active ? "Deactivate Flow" : "Activate Flow"}
                  </button>
                )}
              </div>
            </div>

            {/* Visual node canvas */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <Wrench size={18} style={{ color: "var(--purple)" }} />
                  <div>
                    <h3>Visual Flowchart Designer</h3>
                    <p>
                      Active triggers mapping in database. Current Flow: <strong style={{ color: selectedWorkflow?.is_active ? "var(--green)" : "var(--muted)" }}>{selectedWorkflow?.is_active ? "Live" : "Inactive"}</strong>
                    </p>
                  </div>
                </div>
              </div>
              <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div className="canvas-container">
                  {workflowNodes.map((node) => (
                    <div key={node.id} className={`canvas-node ${node.type}`}>
                      <span style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--muted)" }}>{node.type}</span>
                      <strong style={{ fontSize: "13px", color: "var(--ink)" }}>{node.label}</strong>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid var(--line)", paddingTop: "14px" }}>
                  <h4 style={{ margin: "0 0 10px", fontSize: "13px", color: "var(--muted)" }}>Add Automation Step</h4>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button onClick={() => handleAddCanvasNode("trigger", "Order Created")} className="btn small">
                      + Add Trigger Node
                    </button>
                    <button onClick={() => handleAddCanvasNode("agent", "Route to Tax Agent")} className="btn small">
                      + Add Agent Router
                    </button>
                    <button onClick={() => handleAddCanvasNode("action", "Generate Invoice Draft")} className="btn small">
                      + Add Action Execute
                    </button>
                    <button onClick={() => handleAddCanvasNode("notify", "Send WhatsApp Alert")} className="btn small">
                      + Add WhatsApp Notification
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: CUSTOMER UNIVERSE */}
        {activeSection === "customers" && activeCompany && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <Users size={20} style={{ color: "var(--teal)" }} />
                <div>
                  <h3>Customer Universe Intelligence</h3>
                  <p>Customer profiles, purchase metrics, churn forecasting, and loyalty indicators.</p>
                </div>
              </div>
            </div>
            <div className="panel-body">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Email ID</th>
                      <th>Purchase Count</th>
                      <th className="amount">LTV (Total Spent)</th>
                      <th>Churn Risk</th>
                      <th>Risk Score</th>
                      <th>Behavior Segment</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customersList.map((c) => (
                      <tr key={c.id}>
                        <td><strong>{c.name}</strong></td>
                        <td>{c.email || "N/A"}</td>
                        <td>{c.purchase_count} times</td>
                        <td className="amount" style={{ fontWeight: 800 }}>
                          ₹ {parseFloat(c.total_spent).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ color: parseFloat(c.churn_probability) >= 0.7 ? "var(--rose)" : "var(--ink)" }}>
                          {(parseFloat(c.churn_probability) * 100).toFixed(1)}%
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden", minWidth: "60px" }}>
                              <div style={{
                                height: "100%",
                                width: `${parseFloat(c.risk_score) * 100}%`,
                                background: parseFloat(c.risk_score) >= 0.7 ? "var(--rose)" : parseFloat(c.risk_score) >= 0.3 ? "var(--amber)" : "var(--green)"
                              }} />
                            </div>
                            <span>{(parseFloat(c.risk_score) * 100).toFixed(0)}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status ${
                            c.behavior_segment === "Loyal" || c.behavior_segment === "Active" ? "good" : c.behavior_segment === "At Risk" ? "info" : "bad"
                          }`}>
                            {c.behavior_segment}
                          </span>
                        </td>
                        <td>
                          {c.behavior_segment === "At Risk" && (
                            <button
                              onClick={() => { setActiveSection("workspace"); handleSendChat(undefined, `Draft a win-back discount campaign for ${c.name}`); }}
                              className="btn primary small"
                              style={{ padding: "4px 8px", fontSize: "11px" }}
                            >
                              Target Promo
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 7: EXECUTIVE WAR ROOM */}
        {activeSection === "warroom" && activeCompany && (
          <div className="grid" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Quick Threat Level banner */}
            <div className="panel glass" style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderLeft: `4px solid ${execSummary?.risk_level === "high" ? "var(--rose)" : "var(--amber)"}`,
              background: "rgba(245, 158, 11, 0.03)"
            }}>
              <div>
                <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--muted)" }}>Active Threat Status</span>
                <h3 style={{ margin: "2px 0 0", fontSize: "1.1rem" }}>{execSummary?.risk_summary || "Active competitor pricing action under simulation review."}</h3>
              </div>
              <span className="badge" style={{
                background: execSummary?.risk_level === "high" ? "var(--rose)" : "var(--amber)",
                color: "#070b13",
                fontWeight: "bold",
                fontSize: "12px",
                padding: "4px 12px",
                borderRadius: "6px",
                textTransform: "uppercase"
              }}>
                {execSummary?.risk_level || "Medium"} Risk Level
              </span>
            </div>

            {/* Scorecards */}
            <div className="grid metrics" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div className="panel metric">
                <span>Consolidated Assets</span>
                <strong>₹ {balanceSheet ? parseFloat(balanceSheet.assets).toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "4,52,310"}</strong>
                <small>Liquid & inventory valuations</small>
              </div>
              <div className="panel metric">
                <span>Net Margin</span>
                <strong>₹ {profitLoss ? parseFloat(profitLoss.net_profit).toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "35,450"}</strong>
                <small style={{ color: "var(--green)" }}>{profitLoss && parseFloat(profitLoss.net_profit) >= 0 ? "Profitable" : "Negative"}</small>
              </div>
              <div className="panel metric">
                <span>Active Loyalty Users</span>
                <strong>{execSummary?.active_loyalty_users || "892"}</strong>
                <small>CRM database count</small>
              </div>
              <div className="panel metric">
                <span>Conversion Ratio</span>
                <strong>{execSummary?.conversion_rate || "3.89%"}</strong>
                <small>Checkout funnel percentage</small>
              </div>
            </div>

            {/* Strategic CFO actions list */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <Shield size={20} style={{ color: "var(--teal)" }} />
                  <div>
                    <h3>Strategic Action Ledger</h3>
                    <p>Top decisions suggested by the AI OS agents requiring founder execution.</p>
                  </div>
                </div>
              </div>
              <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: "var(--surface-2)", borderRadius: "8px" }}>
                  <div>
                    <strong style={{ fontSize: "14px", color: "var(--ink)", display: "block" }}>Approve PO-26-004</strong>
                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>Inventory Agent (Kosh) proposes order of 50 Wireless Headphones due to low stock. Cost: ₹2,26,155</span>
                  </div>
                  <button onClick={() => { setActiveSection("workspace"); handleSendChat(undefined, "Show pending purchase orders"); }} className="btn primary small">
                    Approve Decision
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: "var(--surface-2)", borderRadius: "8px" }}>
                  <div>
                    <strong style={{ fontSize: "14px", color: "var(--ink)", display: "block" }}>Increase Pricing: Smart Watch Series 8</strong>
                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>CMO Agent (Prachar) recommends matching competitor price increase to ₹34,999. Expected profit bump: ₹45K.</span>
                  </div>
                  <button onClick={() => { setActiveSection("twin"); setSimPriceChange(7.8); }} className="btn primary small">
                    Run Twin Simulation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: NEW TRANSACTION FORM & DRAFTS */}
        {activeSection === "transaction" && activeCompany && (
          <div className="grid workspace">
            {/* Left panel - Manual Entry Form */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <PlusCircle size={20} style={{ color: "var(--teal)" }} />
                  <div>
                    <h3>Transaction Entry</h3>
                    <p>Enter details of the transaction. Double-entry ledger lines will be generated instantly.</p>
                  </div>
                </div>
              </div>
              <div className="panel-body">
                <form onSubmit={handlePostTransaction} className="form-grid">
                  <div className="two-col">
                    <div className="field">
                      <label htmlFor="txDate">Transaction Date *</label>
                      <input
                        type="date"
                        id="txDate"
                        required
                        value={entryDate}
                        onChange={(e) => setEntryDate(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="txFlow">Transaction Type / Flow *</label>
                      <select
                        id="txFlow"
                        value={txFlow}
                        onChange={(e) => setTxFlow(e.target.value)}
                      >
                        <option value="expense">Expense (Paid Out)</option>
                        <option value="purchase">Purchase Asset / Inventory (Paid Out)</option>
                        <option value="income">Service Income (Received)</option>
                        <option value="sale">Goods Sales (Received)</option>
                        <option value="receipt">Customer Receipt (Reduce Receivable)</option>
                        <option value="payment">Vendor Payment (Reduce Payable)</option>
                        <option value="owner_contribution">Owner Capital Contribution</option>
                        <option value="loan_received">Bank Loan Proceeds</option>
                      </select>
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="txDesc">Description / Narration *</label>
                    <input
                      type="text"
                      id="txDesc"
                      required
                      placeholder="e.g. Rent for May 2026, Office chairs, Consulting fee..."
                      value={txDescription}
                      onChange={(e) => setTxDescription(e.target.value)}
                    />
                  </div>

                  <div className="two-col">
                    <div className="field">
                      <label htmlFor="txAmount">Taxable Base Amount (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        id="txAmount"
                        required
                        placeholder="0.00"
                        value={txAmount}
                        onChange={(e) => setTxAmount(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="txCounterparty">Counterparty Name</label>
                      <input
                        type="text"
                        id="txCounterparty"
                        placeholder="e.g. Landlord, Vendor, Client Name"
                        value={txCounterparty}
                        onChange={(e) => setTxCounterparty(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="two-col">
                    <div className="field">
                      <label htmlFor="txGstTreatment">GST Treatment</label>
                      <select
                        id="txGstTreatment"
                        value={txGstTreatment}
                        onChange={(e) => setTxGstTreatment(e.target.value)}
                      >
                        <option value="intra_state">Intra-state (CGST + SGST)</option>
                        <option value="inter_state">Inter-state (IGST)</option>
                        <option value="exempt">Exempt (0% GST)</option>
                        <option value="none">Out of GST Scope / None</option>
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="txGstRate">GST Rate (%)</label>
                      <select
                        id="txGstRate"
                        disabled={txGstTreatment === "none" || txGstTreatment === "exempt"}
                        value={txGstRate}
                        onChange={(e) => setTxGstRate(e.target.value)}
                      >
                        <option value="18">18% (Standard Services/Goods)</option>
                        <option value="12">12% (Standard)</option>
                        <option value="5">5% (Essentials)</option>
                        <option value="28">28% (Luxury)</option>
                        <option value="0">0%</option>
                      </select>
                    </div>
                  </div>

                  <div className="two-col">
                    <div className="field">
                      <label htmlFor="txPaymentAccount">Payment / Bank Account</label>
                      <select
                        id="txPaymentAccount"
                        value={txPaymentAccount}
                        onChange={(e) => setTxPaymentAccount(e.target.value)}
                      >
                        <option value="1010">Bank (Code 1010)</option>
                        <option value="1000">Cash (Code 1000)</option>
                      </select>
                    </div>
                    {branches.length > 0 && (
                      <div className="field">
                        <label htmlFor="txBranch">Assigned Branch *</label>
                        <select
                          id="txBranch"
                          value={txBranchId}
                          onChange={(e) => setTxBranchId(e.target.value)}
                        >
                          {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="button-row" style={{ marginTop: "14px" }}>
                    <button type="submit" className="btn primary" disabled={isSubmittingTx}>
                      {isSubmittingTx ? "Validating & Posting..." : "Commit Transaction"}
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        setTxDescription("");
                        setTxAmount("");
                        setTxCounterparty("");
                      }}
                    >
                      Clear Fields
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Panel - Bulk Ingestion & Exceptions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Bulk Upload Card */}
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <FileText size={20} style={{ color: "var(--teal)" }} />
                    <div>
                      <h3>Bulk Upload (Excel / CSV)</h3>
                      <p>Upload a transaction registry or bank statement spreadsheet to parse and post in bulk.</p>
                    </div>
                  </div>
                </div>
                <div className="panel-body">
                  <form onSubmit={handleFileUpload} className="form-grid">
                    <div className="field">
                      <label htmlFor="fileInput">Select Spreadsheet (.xlsx, .csv)</label>
                      <div
                        style={{
                          border: "2px dashed var(--line)",
                          borderRadius: "8px",
                          padding: "20px",
                          textAlign: "center",
                          background: "var(--surface-2)",
                          cursor: "pointer"
                        }}
                        onClick={() => document.getElementById("fileInput")?.click()}
                      >
                        {selectedFile ? (
                          <div style={{ fontWeight: 800, color: "var(--teal-ink)" }}>
                            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                          </div>
                        ) : (
                          <div style={{ color: "var(--muted)" }}>
                            Drag and drop or Click to choose transaction file
                          </div>
                        )}
                        <input
                          type="file"
                          id="fileInput"
                          accept=".xlsx,.csv"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              setSelectedFile(e.target.files[0]);
                            }
                          }}
                        />
                      </div>
                    </div>

                    {uploadResult && (
                      <div
                        style={{
                          padding: "10px 14px",
                          borderRadius: "8px",
                          background: "var(--surface-2)",
                          fontSize: "13px",
                          border: "1px solid var(--line)"
                        }}
                      >
                        <div style={{ fontWeight: 800, color: "var(--teal-ink)" }}>Upload Summary:</div>
                        <div style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
                          <div>Total Rows: <strong>{uploadResult.total_rows}</strong></div>
                          <div>Posted: <strong style={{ color: "var(--green)" }}>{uploadResult.posted_count}</strong></div>
                          <div>Exceptions: <strong style={{ color: "var(--rose)" }}>{uploadResult.exception_count}</strong></div>
                        </div>
                      </div>
                    )}

                    <div className="button-row">
                      <button
                        type="submit"
                        className="btn primary"
                        disabled={isUploading || !selectedFile}
                        style={{ width: "100%" }}
                      >
                        {isUploading ? "Uploading & Processing..." : "Upload & Parse Transactions"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Real-time Ingestion / Exception Queue */}
              <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <AlertTriangle size={20} style={{ color: "var(--amber)" }} />
                  <div>
                    <h3>Exception & Review Queue</h3>
                    <p>Transactions failing validation rules or duplicates detected by security audits.</p>
                  </div>
                </div>
              </div>
              <div className="panel-body">
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Details</th>
                        <th>Error / Exception Reason</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drafts.filter(d => d.status === "exception").length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center", color: "var(--green)", padding: "30px", fontWeight: 800 }}>
                            <CheckCircle2 size={36} style={{ display: "block", margin: "0 auto 10px", color: "var(--green)" }} />
                            All draft entries processed cleanly! Exception queue is empty.
                          </td>
                        </tr>
                      ) : (
                        drafts.filter(d => d.status === "exception").map((d) => (
                          <tr key={d.id} style={{ background: "rgba(244, 63, 94, 0.07)" }}>
                            <td>{d.entry_date}</td>
                            <td>
                              <strong style={{ textTransform: "uppercase", fontSize: "11px", color: "var(--muted)" }}>{d.flow}</strong>
                              <div style={{ fontWeight: 800 }}>{d.description}</div>
                              <div>Base: ₹ {parseFloat(d.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                            </td>
                            <td style={{ color: "var(--rose)", fontWeight: 700 }}>
                              {d.exception_reason}
                            </td>
                            <td>
                              <span className="status bad">Exception</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            </div> {/* Closing Right Panel Flex Wrapper */}
          </div>
        )}

        {/* SECTION 3: JOURNAL & LEDGERS */}
        {activeSection === "ledger" && activeCompany && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <FileCheck size={20} style={{ color: "var(--teal)" }} />
                <div>
                  <h3>Auditable Journal Entries</h3>
                  <p>Immutable postings. Double-entry audit history details.</p>
                </div>
              </div>
            </div>
            <div className="panel-body">
              {journals.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                  No posted journal entries found. Submit a manual transaction to populate the ledger.
                </div>
              ) : (
                <div style={{ display: "grid", gap: "20px" }}>
                  {journals.map((j) => (
                    <div key={j.id} style={{ border: "1px solid var(--line)", borderRadius: "8px", overflow: "hidden" }}>
                      {/* Journal Header */}
                      <div
                        style={{
                          background: "var(--surface-2)",
                          padding: "12px 16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderBottom: "1px solid var(--line)"
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 800, fontSize: "15px", color: "var(--teal)" }}>{j.entry_number}</span>
                          <span style={{ color: "var(--muted)", fontSize: "12px", marginLeft: "14px" }}>Date: {j.entry_date}</span>
                        </div>
                        <div>
                          <span style={{ color: "var(--muted)", fontSize: "12px" }}>Posted at: {new Date(j.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      
                      {/* Journal Narration */}
                      <div style={{ padding: "10px 16px", background: "var(--surface-2)", fontStyle: "italic", fontSize: "13px", borderBottom: "1px solid var(--line)" }}>
                        <strong>Narration:</strong> {j.narration}
                      </div>

                      {/* Ledger Lines Table */}
                      <div className="table-wrap">
                        <table style={{ minWidth: "100%" }}>
                          <thead style={{ background: "var(--surface-2)" }}>
                            <tr>
                              <th style={{ padding: "8px 16px" }}>Account Code</th>
                              <th style={{ padding: "8px 16px" }}>Account Name</th>
                              <th style={{ padding: "8px 16px" }}>Description</th>
                              <th style={{ padding: "8px 16px" }} className="amount">Debit</th>
                              <th style={{ padding: "8px 16px" }} className="amount">Credit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {j.lines.map((line) => (
                              <tr key={line.id}>
                                <td style={{ padding: "8px 16px" }}><code>{line.account_code}</code></td>
                                <td style={{ padding: "8px 16px", fontWeight: parseFloat(line.debit) > 0 ? "700" : "400" }}>
                                  {parseFloat(line.credit) > 0 && <span style={{ marginLeft: "16px" }}>To </span>}
                                  {line.account_name}
                                </td>
                                <td style={{ padding: "8px 16px", color: "var(--muted)", fontSize: "12px" }}>{line.description}</td>
                                <td style={{ padding: "8px 16px" }} className="amount">
                                  {parseFloat(line.debit) > 0 ? `₹ ${parseFloat(line.debit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : ""}
                                </td>
                                <td style={{ padding: "8px 16px" }} className="amount">
                                  {parseFloat(line.credit) > 0 ? `₹ ${parseFloat(line.credit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : ""}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 4: REPORTS */}
        {activeSection === "reports" && activeCompany && (
          <div className="grid">
            {/* Date Range Filter Panel */}
            <div className="panel" style={{ gridColumn: "1 / -1", marginBottom: "1rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-end" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Start Date</label>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "white",
                      padding: "0.5rem",
                      borderRadius: "6px",
                      outline: "none"
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>End Date</label>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "white",
                      padding: "0.5rem",
                      borderRadius: "6px",
                      outline: "none"
                    }}
                  />
                </div>
                <button
                  onClick={() => loadCompanyData(selectedCompanyId, filterStartDate, filterEndDate)}
                  className="btn"
                  style={{
                    background: "var(--teal)",
                    color: "var(--deep-bg)",
                    border: "none",
                    padding: "0.55rem 1.25rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  Apply Filter
                </button>
                <button
                  onClick={() => {
                    setFilterStartDate(activeCompany.financial_year_start);
                    setFilterEndDate(activeCompany.financial_year_end);
                    loadCompanyData(selectedCompanyId, activeCompany.financial_year_start, activeCompany.financial_year_end);
                  }}
                  className="btn-secondary"
                  style={{
                    background: "transparent",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.2)",
                    padding: "0.5rem 1.25rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "500"
                  }}
                >
                  Reset to FY
                </button>
              </div>
            </div>
            {/* Report tab selectors */}
            <div className="tabs">
              <button
                onClick={() => setActiveReportTab("tb")}
                className={`tab ${activeReportTab === "tb" ? "active" : ""}`}
              >
                Trial Balance
              </button>
              <button
                onClick={() => setActiveReportTab("pl")}
                className={`tab ${activeReportTab === "pl" ? "active" : ""}`}
              >
                Profit & Loss (P&L)
              </button>
              <button
                onClick={() => setActiveReportTab("bs")}
                className={`tab ${activeReportTab === "bs" ? "active" : ""}`}
              >
                Balance Sheet
              </button>
              <button
                onClick={() => setActiveReportTab("gst")}
                className={`tab ${activeReportTab === "gst" ? "active" : ""}`}
              >
                GST Ledger Summary
              </button>
              <button
                onClick={() => setActiveReportTab("flow")}
                className={`tab ${activeReportTab === "flow" ? "active" : ""}`}
              >
                Transaction Flow
              </button>
              <button
                onClick={() => setActiveReportTab("investor")}
                className={`tab ${activeReportTab === "investor" ? "active" : ""}`}
              >
                Investor Report
              </button>
            </div>

            {/* TAB CONTENT: TRIAL BALANCE */}
            {activeReportTab === "tb" && (
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <CheckCircle2 size={18} style={{ color: "var(--teal)" }} />
                    <div>
                      <h3>Trial Balance Statement</h3>
                      <p>Summary of all ledger accounts to verify mathematical accuracy of debits and credits.</p>
                    </div>
                  </div>
                  <span className={`status ${trialBalance?.is_balanced ? "good" : "bad"}`}>
                    {trialBalance?.is_balanced ? "Balanced" : "Unbalanced"}
                  </span>
                </div>
                <div className="panel-body">
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Account Name</th>
                          <th>Type</th>
                          <th className="amount">Debit Total</th>
                          <th className="amount">Credit Total</th>
                          <th className="amount">Closing Debit</th>
                          <th className="amount">Closing Credit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!trialBalance || trialBalance.rows.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ textAlign: "center", padding: "20px", color: "var(--muted)" }}>
                              No ledger postings to display.
                            </td>
                          </tr>
                        ) : (
                          trialBalance.rows.map((row) => (
                            <tr key={row.account_code}>
                              <td><code>{row.account_code}</code></td>
                              <td style={{ fontWeight: 600 }}>{row.account_name}</td>
                              <td style={{ textTransform: "capitalize", color: "var(--muted)", fontSize: "12px" }}>{row.account_type}</td>
                              <td className="amount">₹ {parseFloat(row.debit_total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                              <td className="amount">₹ {parseFloat(row.credit_total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                              <td className="amount" style={{ fontWeight: 800 }}>
                                {parseFloat(row.closing_debit) > 0 ? `₹ ${parseFloat(row.closing_debit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "-"}
                              </td>
                              <td className="amount" style={{ fontWeight: 800 }}>
                                {parseFloat(row.closing_credit) > 0 ? `₹ ${parseFloat(row.closing_credit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "-"}
                              </td>
                            </tr>
                          ))
                        )}
                        {trialBalance && (
                          <tr style={{ background: "var(--surface-2)", fontWeight: 800 }}>
                            <td colSpan={5} style={{ textAlign: "right" }}>Total Summary:</td>
                            <td className="amount" style={{ borderBottom: "4px double var(--ink)" }}>
                              ₹ {parseFloat(trialBalance.total_debit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="amount" style={{ borderBottom: "4px double var(--ink)" }}>
                              ₹ {parseFloat(trialBalance.total_credit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PROFIT & LOSS */}
            {activeReportTab === "pl" && (
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <TrendingUp size={18} style={{ color: "var(--teal)" }} />
                    <div>
                      <h3>Profit & Loss Account</h3>
                      <p>Summary of revenues and expenses for the current operating period.</p>
                    </div>
                  </div>
                </div>
                <div className="panel-body">
                  <div className="report-grid">
                    <div className="report-box" style={{ background: "rgba(16, 185, 129, 0.1)", borderLeft: "4px solid var(--green)" }}>
                      <span>Gross Operating Revenue</span>
                      <strong>₹ {profitLoss ? parseFloat(profitLoss.income).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}</strong>
                    </div>
                    <div className="report-box" style={{ background: "rgba(244, 63, 94, 0.1)", borderLeft: "4px solid var(--rose)" }}>
                      <span>Total Recognized Expenses</span>
                      <strong>₹ {profitLoss ? parseFloat(profitLoss.expenses).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}</strong>
                    </div>
                    <div className="report-box" style={{
                      background: profitLoss && parseFloat(profitLoss.net_profit) >= 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(244, 63, 94, 0.1)",
                      borderLeft: profitLoss && parseFloat(profitLoss.net_profit) >= 0 ? "4px solid var(--teal)" : "4px solid var(--rose)"
                    }}>
                      <span>Net Operational Profit / Margin</span>
                      <strong>₹ {profitLoss ? parseFloat(profitLoss.net_profit).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}</strong>
                    </div>
                  </div>

                  <div style={{ marginTop: "24px", border: "1px solid var(--line)", borderRadius: "8px", padding: "16px", background: "var(--surface)" }}>
                    <h4 style={{ margin: "0 0 12px 0" }}>Flow Analysis Summary</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Sales Revenue (Direct Goods):</span>
                        <span style={{ fontWeight: 800 }}>
                          ₹ {trialBalance?.rows.find(r => r.account_code === "4000")
                            ? parseFloat(trialBalance.rows.find(r => r.account_code === "4000")!.closing_credit).toLocaleString("en-IN", { minimumFractionDigits: 2 })
                            : "0.00"}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Service Income (Professional / Support):</span>
                        <span style={{ fontWeight: 800 }}>
                          ₹ {trialBalance?.rows.find(r => r.account_code === "4100")
                            ? parseFloat(trialBalance.rows.find(r => r.account_code === "4100")!.closing_credit).toLocaleString("en-IN", { minimumFractionDigits: 2 })
                            : "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: BALANCE SHEET */}
            {activeReportTab === "bs" && (
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <Briefcase size={18} style={{ color: "var(--teal)" }} />
                    <div>
                      <h3>Balance Sheet Statement</h3>
                      <p>Financial snapshot displaying assets, liabilities, and owner equity.</p>
                    </div>
                  </div>
                  <span className={`status ${balanceSheet?.balanced ? "good" : "bad"}`}>
                    {balanceSheet?.balanced ? "Accounting Equation Matches" : "Equation Discrepancy"}
                  </span>
                </div>
                <div className="panel-body">
                  <div className="report-grid" style={{ marginBottom: "24px" }}>
                    <div className="report-box">
                      <span>Total Assets</span>
                      <strong>₹ {balanceSheet ? parseFloat(balanceSheet.assets).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}</strong>
                    </div>
                    <div className="report-box">
                      <span>Total Liabilities</span>
                      <strong>₹ {balanceSheet ? parseFloat(balanceSheet.liabilities).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}</strong>
                    </div>
                    <div className="report-box">
                      <span>Total Equity + Current Profit</span>
                      <strong>
                        ₹ {balanceSheet ? (parseFloat(balanceSheet.equity) + parseFloat(balanceSheet.current_period_profit)).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}
                      </strong>
                    </div>
                  </div>

                  <div style={{ border: "1px solid var(--line)", borderRadius: "8px", overflow: "hidden" }}>
                    <div style={{ background: "var(--surface-2)", padding: "10px 14px", fontWeight: 800, fontSize: "14px" }}>
                      Accounting Equation Verification Check
                    </div>
                    <div style={{ padding: "14px", display: "grid", gap: "10px", fontSize: "13px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Assets:</span>
                        <span>₹ {balanceSheet ? parseFloat(balanceSheet.assets).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Liabilities + Equity:</span>
                        <span>
                          ₹ {balanceSheet ? (parseFloat(balanceSheet.liabilities) + parseFloat(balanceSheet.equity) + parseFloat(balanceSheet.current_period_profit)).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid var(--line)", fontWeight: 800 }}>
                        <span>Difference:</span>
                        <span style={{ color: balanceSheet?.balanced ? "var(--green)" : "var(--rose)" }}>
                          ₹ {balanceSheet ? Math.abs(parseFloat(balanceSheet.assets) - (parseFloat(balanceSheet.liabilities) + parseFloat(balanceSheet.equity) + parseFloat(balanceSheet.current_period_profit))).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    {/* Left Column: Assets */}
                    <div style={{ border: "1px solid var(--line)", borderRadius: "8px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                      <div style={{ background: "var(--surface-2)", padding: "10px 14px", fontWeight: 800, fontSize: "14px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)" }}>
                        <span>Assets</span>
                        <span>Debit Balance</span>
                      </div>
                      <div className="table-wrap" style={{ flex: 1 }}>
                        <table style={{ width: "100%", fontSize: "13px" }}>
                          <tbody>
                            {trialBalance?.rows.filter(r => r.account_type === "asset").map(r => {
                              const bal = parseFloat(r.closing_debit) - parseFloat(r.closing_credit);
                              return (
                                <tr key={r.account_code}>
                                  <td style={{ padding: "8px 14px" }}>
                                    <span style={{ color: "var(--muted)", marginRight: "8px" }}>{r.account_code}</span>
                                    {r.account_name}
                                  </td>
                                  <td style={{ padding: "8px 14px", textAlign: "right", fontWeight: 700 }}>
                                    ₹ {bal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              );
                            })}
                            {(!trialBalance || trialBalance.rows.filter(r => r.account_type === "asset").length === 0) && (
                              <tr>
                                <td colSpan={2} style={{ padding: "14px", textAlign: "center", color: "var(--muted)" }}>No asset accounts found.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ background: "var(--surface-2)", padding: "10px 14px", fontWeight: 800, fontSize: "13px", display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)", marginTop: "auto" }}>
                        <span>Total Assets:</span>
                        <span>₹ {balanceSheet ? parseFloat(balanceSheet.assets).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}</span>
                      </div>
                    </div>

                    {/* Right Column: Liabilities & Equity */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {/* Liabilities Section */}
                      <div style={{ border: "1px solid var(--line)", borderRadius: "8px", overflow: "hidden" }}>
                        <div style={{ background: "var(--surface-2)", padding: "10px 14px", fontWeight: 800, fontSize: "14px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)" }}>
                          <span>Liabilities</span>
                          <span>Credit Balance</span>
                        </div>
                        <div className="table-wrap">
                          <table style={{ width: "100%", fontSize: "13px" }}>
                            <tbody>
                              {trialBalance?.rows.filter(r => r.account_type === "liability").map(r => {
                                const bal = parseFloat(r.closing_credit) - parseFloat(r.closing_debit);
                                return (
                                  <tr key={r.account_code}>
                                    <td style={{ padding: "8px 14px" }}>
                                      <span style={{ color: "var(--muted)", marginRight: "8px" }}>{r.account_code}</span>
                                      {r.account_name}
                                    </td>
                                    <td style={{ padding: "8px 14px", textAlign: "right", fontWeight: 700 }}>
                                      ₹ {bal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </td>
                                  </tr>
                                );
                              })}
                              {(!trialBalance || trialBalance.rows.filter(r => r.account_type === "liability").length === 0) && (
                                <tr>
                                  <td colSpan={2} style={{ padding: "14px", textAlign: "center", color: "var(--muted)" }}>No liability accounts found.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        <div style={{ background: "var(--surface-2)", padding: "10px 14px", fontWeight: 800, fontSize: "13px", display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)" }}>
                          <span>Total Liabilities:</span>
                          <span>₹ {balanceSheet ? parseFloat(balanceSheet.liabilities).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}</span>
                        </div>
                      </div>

                      {/* Equity Section */}
                      <div style={{ border: "1px solid var(--line)", borderRadius: "8px", overflow: "hidden" }}>
                        <div style={{ background: "var(--surface-2)", padding: "10px 14px", fontWeight: 800, fontSize: "14px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)" }}>
                          <span>Owner's Equity & Retained Earnings</span>
                          <span>Credit Balance</span>
                        </div>
                        <div className="table-wrap">
                          <table style={{ width: "100%", fontSize: "13px" }}>
                            <tbody>
                              {trialBalance?.rows.filter(r => r.account_type === "equity").map(r => {
                                const bal = parseFloat(r.closing_credit) - parseFloat(r.closing_debit);
                                return (
                                  <tr key={r.account_code}>
                                    <td style={{ padding: "8px 14px" }}>
                                      <span style={{ color: "var(--muted)", marginRight: "8px" }}>{r.account_code}</span>
                                      {r.account_name}
                                    </td>
                                    <td style={{ padding: "8px 14px", textAlign: "right", fontWeight: 700 }}>
                                      ₹ {bal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </td>
                                  </tr>
                                );
                              })}
                              {/* Current period profit is also equity */}
                              {balanceSheet && (
                                <tr>
                                  <td style={{ padding: "8px 14px" }}>
                                    <span style={{ color: "var(--muted)", marginRight: "8px" }}>P&L</span>
                                    Current Period Profit / Loss
                                  </td>
                                  <td style={{ padding: "8px 14px", textAlign: "right", fontWeight: 700, color: parseFloat(balanceSheet.current_period_profit) >= 0 ? "var(--green)" : "var(--rose)" }}>
                                    ₹ {parseFloat(balanceSheet.current_period_profit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        <div style={{ background: "var(--surface-2)", padding: "10px 14px", fontWeight: 800, fontSize: "13px", display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)" }}>
                          <span>Total Equity:</span>
                          <span>
                            ₹ {balanceSheet ? (parseFloat(balanceSheet.equity) + parseFloat(balanceSheet.current_period_profit)).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: GST SUMMARY */}
            {activeReportTab === "gst" && (
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <FileCheck size={18} style={{ color: "var(--teal)" }} />
                    <div>
                      <h3>GST Ledger & Reconciliation</h3>
                      <p>Summary of Output GST on sales and Input Tax Credit (ITC) on purchases/expenses.</p>
                    </div>
                  </div>
                </div>
                <div className="panel-body">
                  <div className="report-grid" style={{ marginBottom: "24px" }}>
                    <div className="report-box" style={{ borderLeft: "4px solid var(--green)" }}>
                      <span>Input Tax Credit (ITC) Available</span>
                      <strong>₹ {gstSummary ? parseFloat(gstSummary.input_gst).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}</strong>
                    </div>
                    <div className="report-box" style={{ borderLeft: "4px solid var(--rose)" }}>
                      <span>Output GST Liability</span>
                      <strong>₹ {gstSummary ? parseFloat(gstSummary.output_gst).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}</strong>
                    </div>
                    <div className="report-box" style={{
                      borderLeft: gstSummary && parseFloat(gstSummary.net_payable) >= 0 ? "4px solid var(--amber)" : "4px solid var(--green)"
                    }}>
                      <span>Net GST Liability Payable</span>
                      <strong>₹ {gstSummary ? parseFloat(gstSummary.net_payable).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}</strong>
                    </div>
                  </div>

                  {/* GST Buckets Breakdown */}
                  {gstSummary && Object.keys(gstSummary.buckets).length > 0 && (
                    <div style={{ border: "1px solid var(--line)", borderRadius: "8px", overflow: "hidden" }}>
                      <div style={{ background: "var(--surface-2)", padding: "10px 14px", fontWeight: 800, fontSize: "14px" }}>
                        Tax Buckets Breakdown (Central/State/Integrated splits)
                      </div>
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>GST Account Bucket</th>
                              <th className="amount">Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(gstSummary.buckets).map(([bucketName, balance]) => (
                              <tr key={bucketName}>
                                <td style={{ textTransform: "capitalize", fontWeight: 600 }}>{bucketName.replace("_", " ")}</td>
                                <td className="amount" style={{ fontWeight: 800 }}>
                                  ₹ {parseFloat(balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeReportTab === "flow" && (
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <TrendingUp size={18} style={{ color: "var(--blue)" }} />
                    <div>
                      <h3>Transaction Flow & Data Analysis</h3>
                      <p>Visual map mapping accounting allocations and inflows/outflows across core ledger nodes.</p>
                    </div>
                  </div>
                </div>
                <div className="panel-body">
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div className="table-wrap" style={{ border: "1px solid var(--line)", borderRadius: "8px", padding: "16px", background: "var(--surface-2)" }}>
                      <svg viewBox="0 0 800 400" width="100%" height="320" style={{ background: "var(--surface)", borderRadius: "8px", border: "1px solid var(--line)" }}>
                        <defs>
                          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)" />
                          </marker>
                          <marker id="arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--green)" />
                          </marker>
                          <marker id="arrow-rose" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--rose)" />
                          </marker>
                        </defs>

                        {/* Node 1: Sales / Revenue */}
                        <rect x="50" y="50" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--blue)" strokeWidth="2" />
                        <text x="130" y="80" textAnchor="middle" fill="var(--ink)" fontWeight="bold" fontSize="13">Revenue (Sales)</text>
                        <text x="130" y="105" textAnchor="middle" fill="var(--blue)" fontWeight="bold" fontSize="14">
                          ₹ {parseFloat(profitLoss?.income || "0").toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </text>

                        {/* Node 2: Capital/Equity */}
                        <rect x="50" y="280" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--purple)" strokeWidth="2" />
                        <text x="130" y="310" textAnchor="middle" fill="var(--ink)" fontWeight="bold" fontSize="13">Equity & Capital</text>
                        <text x="130" y="335" textAnchor="middle" fill="var(--purple)" fontWeight="bold" fontSize="14">
                          ₹ {parseFloat(balanceSheet?.equity || "0").toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </text>

                        {/* Node 3: Cash / Bank (Center Hub) */}
                        <circle cx="400" cy="200" r="60" fill="var(--surface-2)" stroke="var(--teal)" strokeWidth="3" />
                        <text x="400" y="195" textAnchor="middle" fill="var(--ink)" fontWeight="bold" fontSize="14">Cash & Bank</text>
                        <text x="400" y="220" textAnchor="middle" fill="var(--teal)" fontWeight="bold" fontSize="15">
                          ₹ {(() => {
                            const cashAcc = trialBalance?.rows.find(r => r.account_code === "1000");
                            if (!cashAcc) return "0";
                            return (parseFloat(cashAcc.closing_debit) - parseFloat(cashAcc.closing_credit)).toLocaleString("en-IN", { maximumFractionDigits: 0 });
                          })()}
                        </text>

                        {/* Node 4: Purchases & Expenses */}
                        <rect x="590" y="50" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--rose)" strokeWidth="2" />
                        <text x="670" y="80" textAnchor="middle" fill="var(--ink)" fontWeight="bold" fontSize="13">Expenses (OpEx)</text>
                        <text x="670" y="105" textAnchor="middle" fill="var(--rose)" fontWeight="bold" fontSize="14">
                          ₹ {parseFloat(profitLoss?.expenses || "0").toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </text>

                        {/* Node 5: Taxes & GST */}
                        <rect x="590" y="280" width="160" height="70" rx="8" fill="var(--surface-2)" stroke="var(--amber)" strokeWidth="2" />
                        <text x="670" y="310" textAnchor="middle" fill="var(--ink)" fontWeight="bold" fontSize="13">Net GST Liability</text>
                        <text x="670" y="335" textAnchor="middle" fill="var(--amber)" fontWeight="bold" fontSize="14">
                          ₹ {parseFloat(gstSummary?.net_payable || "0").toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </text>

                        {/* Flow Arrows */}
                        <path d="M 210 95 Q 310 120 350 160" fill="none" stroke="var(--green)" strokeWidth="2" markerEnd="url(#arrow-green)" />
                        <text x="260" y="115" fill="var(--green)" fontSize="11" fontWeight="bold">Customer Sales</text>

                        <path d="M 210 305 Q 310 280 350 240" fill="none" stroke="var(--purple)" strokeWidth="2" markerEnd="url(#arrow)" />
                        <text x="260" y="295" fill="var(--purple)" fontSize="11" fontWeight="bold">Capital Funds</text>

                        <path d="M 450 160 Q 490 120 590 95" fill="none" stroke="var(--rose)" strokeWidth="2" markerEnd="url(#arrow-rose)" />
                        <text x="500" y="115" fill="var(--rose)" fontSize="11" fontWeight="bold">OpEx Payouts</text>

                        <path d="M 450 240 Q 490 280 590 305" fill="none" stroke="var(--amber)" strokeWidth="2" markerEnd="url(#arrow)" />
                        <text x="500" y="295" fill="var(--amber)" fontSize="11" fontWeight="bold">Tax Settlement</text>
                      </svg>
                    </div>

                    <div style={{ border: "1px solid var(--line)", borderRadius: "8px", padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      <div>
                        <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "var(--ink)" }}>Inflow Channels</h4>
                        <p style={{ fontSize: "13px", color: "var(--muted)", margin: "0 0 14px 0" }}>Analysis of fund routes entering the company bank ledger.</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", background: "var(--surface-2)", padding: "8px", borderRadius: "4px" }}>
                            <span>Operating Revenues (Sales)</span>
                            <strong style={{ color: "var(--green)" }}>₹ {profitLoss ? parseFloat(profitLoss.income).toLocaleString("en-IN") : "0"}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", background: "var(--surface-2)", padding: "8px", borderRadius: "4px" }}>
                            <span>Equity/Owner Investments</span>
                            <strong style={{ color: "var(--purple)" }}>₹ {balanceSheet ? parseFloat(balanceSheet.equity).toLocaleString("en-IN") : "0"}</strong>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "var(--ink)" }}>Outflow Channels</h4>
                        <p style={{ fontSize: "13px", color: "var(--muted)", margin: "0 0 14px 0" }}>Analysis of ledger items debiting cash/bank reserves.</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", background: "var(--surface-2)", padding: "8px", borderRadius: "4px" }}>
                            <span>Operating Expenses</span>
                            <strong style={{ color: "var(--rose)" }}>₹ {profitLoss ? parseFloat(profitLoss.expenses).toLocaleString("en-IN") : "0"}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", background: "var(--surface-2)", padding: "8px", borderRadius: "4px" }}>
                            <span>Government Taxes (GST Net)</span>
                            <strong style={{ color: "var(--amber)" }}>₹ {gstSummary ? parseFloat(gstSummary.net_payable).toLocaleString("en-IN") : "0"}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeReportTab === "investor" && (
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <Sparkles size={18} style={{ color: "var(--purple)" }} />
                    <div>
                      <h3>Investor Research Report</h3>
                      <p>Annual financial analysis, investment ratios, and AI commentary compiled for equity investors and board members.</p>
                    </div>
                  </div>
                </div>
                <div className="panel-body">
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Scorecard Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                      <div style={{ padding: "14px", borderRadius: "8px", background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                        <span style={{ fontSize: "11px", color: "var(--muted)", display: "block" }}>Liquidity Ratio (Current)</span>
                        <strong style={{ fontSize: "20px", display: "block", marginTop: "4px", color: "var(--blue)" }}>
                          {(() => {
                            if (!balanceSheet) return "0.00";
                            const liab = Math.abs(parseFloat(balanceSheet.liabilities));
                            if (liab === 0) return "∞";
                            return (parseFloat(balanceSheet.assets) / liab).toFixed(2);
                          })()}x
                        </strong>
                        <small style={{ fontSize: "11px", color: "var(--muted)" }}>Target: &gt; 1.5x</small>
                      </div>

                      <div style={{ padding: "14px", borderRadius: "8px", background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                        <span style={{ fontSize: "11px", color: "var(--muted)", display: "block" }}>Gearing Ratio (D/E)</span>
                        <strong style={{ fontSize: "20px", display: "block", marginTop: "4px", color: "var(--purple)" }}>
                          {(() => {
                            if (!balanceSheet) return "0.00";
                            const eq = parseFloat(balanceSheet.equity) + parseFloat(balanceSheet.current_period_profit);
                            if (eq === 0) return "1.00";
                            return (Math.abs(parseFloat(balanceSheet.liabilities)) / eq).toFixed(2);
                          })()}x
                        </strong>
                        <small style={{ fontSize: "11px", color: "var(--muted)" }}>Target: &lt; 2.0x</small>
                      </div>

                      <div style={{ padding: "14px", borderRadius: "8px", background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                        <span style={{ fontSize: "11px", color: "var(--muted)", display: "block" }}>Net Profit Margin</span>
                        <strong style={{ fontSize: "20px", display: "block", marginTop: "4px", color: "var(--green)" }}>
                          {(() => {
                            if (!profitLoss || parseFloat(profitLoss.income) === 0) return "0.0%";
                            return ((parseFloat(profitLoss.net_profit) / parseFloat(profitLoss.income)) * 100).toFixed(1) + "%";
                          })()}
                        </strong>
                        <small style={{ fontSize: "11px", color: "var(--muted)" }}>Industry standard avg: 10%</small>
                      </div>

                      <div style={{ padding: "14px", borderRadius: "8px", background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                        <span style={{ fontSize: "11px", color: "var(--muted)", display: "block" }}>Return on Equity (ROE)</span>
                        <strong style={{ fontSize: "20px", display: "block", marginTop: "4px", color: "var(--teal)" }}>
                          {(() => {
                            if (!profitLoss || !balanceSheet) return "0.0%";
                            const eq = parseFloat(balanceSheet.equity) + parseFloat(balanceSheet.current_period_profit);
                            if (eq <= 0) return "0.0%";
                            return ((parseFloat(profitLoss.net_profit) / eq) * 100).toFixed(1) + "%";
                          })()}
                        </strong>
                        <small style={{ fontSize: "11px", color: "var(--muted)" }}>Target: &gt; 15%</small>
                      </div>
                    </div>

                    {/* AI Investor Advisory Commentary */}
                    <div style={{ border: "1px solid var(--line)", borderRadius: "8px", overflow: "hidden" }}>
                      <div style={{ background: "var(--surface-2)", padding: "12px 16px", fontWeight: 800, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Board & Investor Advisory Commentary</span>
                        <span style={{ fontSize: "11px", color: "var(--purple)", background: "rgba(168, 85, 247, 0.1)", padding: "2px 8px", borderRadius: "10px" }}>Investor-Ready</span>
                      </div>
                      <div style={{ padding: "16px", fontSize: "14px", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "14px" }}>
                        <p>
                          <strong>Executive Thesis:</strong> The financial statements for <strong>{activeCompany.name}</strong> indicate a highly unique structural profile. The current period shows total operating revenues of <strong>₹ {profitLoss ? parseFloat(profitLoss.income).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}</strong>, generating a net profit margins threshold of <strong>
                            {(() => {
                              if (!profitLoss || parseFloat(profitLoss.income) === 0) return "0.0%";
                              return ((parseFloat(profitLoss.net_profit) / parseFloat(profitLoss.income)) * 100).toFixed(1) + "%";
                            })()}
                          </strong>.
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "10px" }}>
                          <div style={{ padding: "12px", borderRadius: "6px", background: "rgba(16, 185, 129, 0.04)", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
                            <strong style={{ color: "var(--green)", fontSize: "12px", display: "block", marginBottom: "6px" }}>Financial Strengths</strong>
                            <ul style={{ paddingLeft: "16px", margin: 0, fontSize: "12px", color: "var(--muted)", display: "flex", flexDirection: "column", gap: "4px" }}>
                              <li>Double-entry equation is perfectly balanced with ₹0 variance.</li>
                              <li>Liquid ratio is comfortable, presenting minimal short-term cash crunch.</li>
                              <li>Low operational debt-gearing reduces balance sheet exposure risk.</li>
                            </ul>
                          </div>

                          <div style={{ padding: "12px", borderRadius: "6px", background: "rgba(244, 63, 94, 0.04)", border: "1px solid rgba(244, 63, 94, 0.15)" }}>
                            <strong style={{ color: "var(--rose)", fontSize: "12px", display: "block", marginBottom: "6px" }}>Risk & Dilution Factors</strong>
                            <ul style={{ paddingLeft: "16px", margin: 0, fontSize: "12px", color: "var(--muted)", display: "flex", flexDirection: "column", gap: "4px" }}>
                              <li>Revenues are concentrated within specific customer ledgers.</li>
                              <li>Net margins can be optimized by reducing variable operating overhead.</li>
                              <li>Working capital is sensitive to tax settlement schedules.</li>
                            </ul>
                          </div>
                        </div>

                        <p style={{ margin: "10px 0 0 0", padding: "10px", borderRadius: "6px", background: "var(--surface-2)", fontSize: "13px", borderLeft: "3px solid var(--purple)" }}>
                          <strong>Advisory Outlook:</strong> From an investment standpoint, {activeCompany.name} is well-capitalized with solid organic operations. Board suggestion is to maintain current margins while seeking moderate leverage to expand operations into multi-branch setups.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 5: AI ADVISORY */}
        {activeSection === "advisory" && activeCompany && (
          <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
            {advisoryReport ? (
              <div style={{ display: "grid", gap: "20px" }}>
                {/* Executive Summary panel */}
                <div className="panel" style={{ borderLeft: "4px solid var(--teal)" }}>
                  <div className="panel-header">
                    <div className="panel-title">
                      <Sparkles size={20} style={{ color: "var(--teal)" }} />
                      <div>
                        <h3>{advisoryReport.title || "AI Management Explanation"}</h3>
                        <p>Automated summary explaining the underlying financial dynamics and accounts status.</p>
                      </div>
                    </div>
                  </div>
                  <div className="panel-body">
                    <h4 style={{ margin: "0 0 8px 0" }}>Accountant Explanation</h4>
                    <p style={{ lineHeight: "1.6", color: "var(--ink)" }}>{advisoryReport.accountant_explanation}</p>
                    
                    <h4 style={{ margin: "20px 0 8px 0" }}>Management Overview</h4>
                    <p style={{ lineHeight: "1.6", color: "var(--muted)" }}>{advisoryReport.management_summary}</p>
                  </div>
                </div>

                {/* Anomalies & Strategy Split */}
                <div className="grid workspace" style={{ marginTop: "0" }}>
                  {/* Anomalies & Auditing Flags */}
                  <div className="panel">
                    <div className="panel-header">
                      <div className="panel-title">
                        <AlertTriangle size={18} style={{ color: "var(--rose)" }} />
                        <div>
                          <h3>Security & Audit Anomalies</h3>
                          <p>Potential risk items needing review before tax filings.</p>
                        </div>
                      </div>
                    </div>
                    <div className="panel-body">
                      {advisoryReport.anomaly_notes.length === 0 ? (
                        <div style={{ color: "var(--green)", fontWeight: 800, display: "flex", gap: "8px", alignItems: "center" }}>
                          <CheckCircle2 size={18} /> No significant anomalies flagged.
                        </div>
                      ) : (
                        <ul className="insight-list">
                          {advisoryReport.anomaly_notes.map((note, index) => (
                            <li key={index} style={{ borderLeft: "3px solid var(--rose)", background: "rgba(244, 63, 94, 0.07)" }}>
                              <AlertCircle size={16} style={{ color: "var(--rose)", flexShrink: 0, marginTop: "2px" }} />
                              <span>{note}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Strategic business advice */}
                  <div className="panel">
                    <div className="panel-header">
                      <div className="panel-title">
                        <Sparkles size={18} style={{ color: "var(--teal)" }} />
                        <div>
                          <h3>Operational Business Insights</h3>
                          <p>Strategic growth options based on cash margins.</p>
                        </div>
                      </div>
                    </div>
                    <div className="panel-body">
                      {advisoryReport.business_advice.length === 0 ? (
                        <div style={{ color: "var(--muted)" }}>No advice compiled yet. Add more operational transactions.</div>
                      ) : (
                        <ul className="insight-list">
                          {advisoryReport.business_advice.map((advice, index) => (
                            <li key={index} style={{ borderLeft: "3px solid var(--teal)", background: "rgba(16, 185, 129, 0.07)" }}>
                              <CheckCircle2 size={16} style={{ color: "var(--green)", flexShrink: 0, marginTop: "2px" }} />
                              <span>{advice}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* Investment commentaries */}
                {advisoryReport.investment_goal_commentary && (
                  <div className="panel">
                    <div className="panel-header">
                      <div className="panel-title">
                        <TrendingUp size={18} style={{ color: "var(--teal)" }} />
                        <div>
                          <h3>Investment & Growth Commentary</h3>
                          <p>Capital management recommendations.</p>
                        </div>
                      </div>
                    </div>
                    <div className="panel-body">
                      <p style={{ lineHeight: "1.6" }}>{advisoryReport.investment_goal_commentary}</p>
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <div style={{ fontSize: "11px", color: "var(--muted)", fontStyle: "italic", textAlign: "center", marginTop: "10px" }}>
                  {advisoryReport.advisory_disclaimer}
                </div>
              </div>
            ) : (
              <div className="panel" style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
                No AI Advisory commentary available yet. Ensure at least some ledger postings are created to trigger generation.
              </div>
            )}
          </div>
        )}
        {/* SECTION 6: DEVELOPER PORTAL */}
        {activeSection === "developer" && activeCompany && (
          <div style={{ display: "grid", gap: "24px" }}>
            <div className="grid workspace" style={{ marginTop: "0", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px" }}>
              {/* API Key Management card */}
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <Key size={20} style={{ color: "var(--teal)" }} />
                    <div>
                      <h3>API Access Control</h3>
                      <p>Generate secure keys to allow custom external agents to write to the ledger or query reports.</p>
                    </div>
                  </div>
                </div>
                <div className="panel-body">
                  {/* Create New Key Form */}
                  <form onSubmit={handleCreateDeveloperKey} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                    <input
                      type="text"
                      placeholder="e.g. Warehouse Bot Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--line)",
                        background: "var(--surface-2)",
                        color: "var(--ink)"
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isCreatingKey || !newKeyName.trim()}
                      className="btn primary"
                      style={{ display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      {isCreatingKey ? <RefreshCw size={14} className="spin" /> : <Plus size={16} />}
                      <span>Generate Key</span>
                    </button>
                  </form>

                  {/* List of keys */}
                  <div className="table-wrap" style={{ border: "1px solid var(--line)", borderRadius: "8px" }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Key Name</th>
                          <th>API Key Token</th>
                          <th>Status</th>
                          <th>Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {devKeys.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ textAlign: "center", color: "var(--muted)", padding: "20px" }}>
                              No developer API keys active. Generate one above.
                            </td>
                          </tr>
                        ) : (
                          devKeys.map((k) => (
                            <tr key={k.id}>
                              <td style={{ fontWeight: 800 }}>{k.key_name}</td>
                              <td>
                                <code style={{
                                  background: "var(--surface-2)",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  fontFamily: "monospace",
                                  fontSize: "12px",
                                  color: "var(--purple)"
                                }}>
                                  {k.api_key.substring(0, 10)}...{k.api_key.substring(k.api_key.length - 6)}
                                </code>
                              </td>
                              <td>
                                <span className={`status ${k.is_active ? "good" : "bad"}`}>
                                  {k.is_active ? "Active" : "Revoked"}
                                </span>
                              </td>
                              <td style={{ fontSize: "12px", color: "var(--muted)" }}>
                                {new Date(k.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Webhook Delivery Logs */}
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <Globe size={20} style={{ color: "var(--teal)" }} />
                    <div>
                      <h3>Webhook Deliveries</h3>
                      <p>Real-time event logging to external worker nodes.</p>
                    </div>
                  </div>
                </div>
                <div className="panel-body" style={{ maxHeight: "350px", overflowY: "auto" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {webhookLogs.map((log) => (
                      <div
                        key={log.id}
                        style={{
                          border: "1px solid var(--line)",
                          borderRadius: "8px",
                          padding: "12px",
                          background: "var(--surface-2)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "12px", color: "var(--teal)" }}>
                            {log.event}
                          </span>
                          <span style={{
                            fontSize: "11px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontWeight: 700,
                            background: log.status >= 200 && log.status < 300 ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                            color: log.status >= 200 && log.status < 300 ? "var(--green)" : "var(--rose)"
                          }}>
                            HTTP {log.status}
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--muted)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {log.url}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--muted)", marginTop: "4px" }}>
                          <span>{log.attempt ? `Attempt #${log.attempt}` : "Delivery Success"}</span>
                          <span>{log.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Branch Management Card */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <Building2 size={20} style={{ color: "var(--teal)" }} />
                  <div>
                    <h3>Branch Management</h3>
                    <p>Create and manage different locations or business divisions under this company.</p>
                  </div>
                </div>
              </div>
              <div className="panel-body">
                {/* Create New Branch Form */}
                <form onSubmit={handleCreateBranch} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  <input
                    type="text"
                    placeholder="Branch Name (e.g. Mumbai Branch)"
                    required
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "var(--text-color)",
                      fontSize: "13px"
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Code (e.g. MUMBAI)"
                    required
                    value={newBranchCode}
                    onChange={(e) => setNewBranchCode(e.target.value.toUpperCase())}
                    style={{
                      width: "120px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "var(--text-color)",
                      fontSize: "13px"
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isCreatingBranch || !newBranchName.trim() || !newBranchCode.trim()}
                    className="btn primary"
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    {isCreatingBranch ? <RefreshCw size={14} className="spin" /> : <Plus size={16} />}
                    <span>Add Branch</span>
                  </button>
                </form>

                {/* List of branches */}
                <div className="table-wrap" style={{ border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Branch Name</th>
                        <th>Code</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branches.length === 0 ? (
                        <tr>
                          <td colSpan={3} style={{ textAlign: "center", color: "var(--muted)", padding: "20px" }}>
                            No branches found.
                          </td>
                        </tr>
                      ) : (
                        branches.map((b) => (
                          <tr key={b.id}>
                            <td style={{ fontWeight: 800 }}>{b.name}</td>
                            <td>
                              <code style={{
                                background: "rgba(255, 255, 255, 0.05)",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontFamily: "monospace",
                                fontSize: "12px",
                                color: "var(--teal-ink)"
                              }}>
                                {b.code}
                              </code>
                            </td>
                            <td style={{ fontSize: "12px", color: "var(--muted)" }}>
                              {new Date(b.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* SDK Code Snippet Tab */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <Settings size={20} style={{ color: "var(--teal)" }} />
                  <div>
                    <h3>SDK & Integration Guide</h3>
                    <p>Integrate any custom autonomous worker node into the Sudarshan General Ledger.</p>
                  </div>
                </div>
              </div>
              <div className="panel-body">
                <div style={{ display: "flex", gap: "10px", marginBottom: "14px", borderBottom: "1px solid var(--line)", paddingBottom: "10px" }}>
                  <span style={{ fontWeight: 800, borderBottom: "2px solid var(--teal)", paddingBottom: "8px", cursor: "pointer", color: "var(--teal)" }}>Python SDK</span>
                  <span style={{ color: "var(--muted)", cursor: "not-allowed" }}>NodeJS SDK</span>
                  <span style={{ color: "var(--muted)", cursor: "not-allowed" }}>Go client</span>
                </div>

                <pre style={{
                  background: "#1e293b",
                  color: "#e2e8f0",
                  padding: "16px",
                  borderRadius: "8px",
                  overflowX: "auto",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  lineHeight: "1.6"
                }}>
{`import os
from sudarshan import SudarshanClient

# Initialize the client using your live token
client = SudarshanClient(
    api_key="${devKeys[0]?.api_key || "sd_live_your_token_here"}",
    company_id="${selectedCompanyId}"
)

# Listen to low stock triggers or post a ledger line
@client.on_event("inventory.stock.critical")
def handle_low_stock(event):
    print(f"Trigger PO workflow for item: {event.product_sku}")
    client.ledger.post_transaction(
        entry_date=event.timestamp.date(),
        description=f"Auto-replenish PO draft: {event.product_sku}",
        amount=event.estimated_cost,
        flow="purchase"
    )`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </>
    )}
  </main>
</div>
);
}
