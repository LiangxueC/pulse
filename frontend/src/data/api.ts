import type {
  DashboardResponse,
  CashFlowDetailResponse,
  InvoicesResponse,
  BillsResponse,
  ArchivedCase,
  ChatMessage,
  Subscription,
  CashRedirect,
  RedirectImpact,
} from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const fetchDashboard = (completedCategories: string[] = []) => {
  const params = completedCategories.map(c => `completed=${c}`).join("&");
  return request<DashboardResponse>(`/api/dashboard/${params ? `?${params}` : ""}`);
};

export const fetchCashFlowDetail = (completedCategories: string[] = []) => {
  const params = completedCategories.map(c => `completed=${c}`).join("&");
  return request<CashFlowDetailResponse>(`/api/cashflow/detail${params ? `?${params}` : ""}`);
};

export const fetchStepExplanation = (stepId: string) =>
  request<{ stepId: string; explanation: string }>(
    `/api/cashflow/steps/${stepId}/explain`
  );

export const fetchInvoices = () =>
  request<InvoicesResponse>("/api/invoices/");

export const sendReminders = () =>
  request<{ success: boolean; message: string; companies: string[] }>(
    "/api/invoices/remind-all",
    { method: "POST" }
  );

export const fetchBills = () =>
  request<BillsResponse>("/api/bills/");

export const payAllBills = () =>
  request<{ success: boolean; message: string; totalPaid: number }>(
    "/api/bills/pay-all",
    { method: "POST" }
  );

export const fetchArchivedCases = (search = "") =>
  request<{ items: ArchivedCase[] }>(
    `/api/cases/${search ? `?search=${encodeURIComponent(search)}` : ""}`
  );

export const deleteCase = (caseId: string) =>
  request<{ success: boolean }>(`/api/cases/${caseId}`, { method: "DELETE" });

export const deleteCases = (ids: string[]) =>
  request<{ success: boolean; deletedCount: number }>("/api/cases/bulk", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });

export const closeCase = (stepsTaken: object[], stepsSkipped: object[]) =>
  request<{ success: boolean; case: ArchivedCase }>("/api/actions/close", {
    method: "POST",
    body: JSON.stringify({ stepsTaken, stepsSkipped }),
  });

export const sendChatMessage = (messages: ChatMessage[]) =>
  request<{ reply: string }>("/api/chat/", {
    method: "POST",
    body: JSON.stringify({ messages }),
  });

export const sendActionFeedback = (
  feedback: string,
  category: string,
  currentResult: object
) =>
  request<{ reply: string }>("/api/chat/action-feedback", {
    method: "POST",
    body: JSON.stringify({ feedback, category, currentResult }),
  });

export const fetchSubscriptionRanking = () =>
  request<{ subscriptions: Subscription[] }>("/api/actions/subscriptions");

export const fetchCashRedirects = () =>
  request<{ redirects: CashRedirect[] }>("/api/actions/cash-redirects");

export const fetchRedirectImpact = (redirectId: string) =>
  request<RedirectImpact>(`/api/actions/redirect-impact/${redirectId}`);

export const executeAction = (category: string, stepText: string) =>
  request<{
    category: string;
    summary: string;
    bullets: string[];
    impact: string;
    monthlySaving: number;
    balanceLift: number;
  }>("/api/actions/execute", {
    method: "POST",
    body: JSON.stringify({ category, stepText }),
  });

export const fetchPayrollSummary = () =>
  request<{ summary: string }>("/api/actions/payroll-summary");