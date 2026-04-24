import React, { useState } from "react";
import "./index.css";
import type { Screen, SuggestedStep } from "./types";
import { useScreen } from "./hooks/useScreen";
import { useChat } from "./hooks/useChat";

import { Sidebar } from "./components/Sidebar";
import { TopNav, TabNav, SubscribeBanner } from "./components/TopNav";
import { ChatDrawer } from "./components/ChatDrawer";

import { DashboardScreen } from "./screens/DashboardScreen";
import { DetailScreen } from "./screens/DetailScreen";
import { NextStepsScreen } from "./screens/NextStepsScreen";
import { ActionChoiceScreen } from "./screens/ActionChoiceScreen";
import { ArchivedCasesScreen } from "./screens/ArchivedCasesScreen";
import { TakeActionScreen } from "./screens/TakeActionScreen";
import { PayrollSummaryScreen } from "./screens/PayrollSummaryScreen";
import { ActionConfirmationScreen } from "./screens/ActionConfirmationScreen";
import { DoItMyselfScreen } from "./screens/DoItMyselfScreen";
import { CashRedirectsScreen } from "./screens/CashRedirectsScreen";
import { RedirectImpactScreen } from "./screens/RedirectImpactScreen";
import { ClosingReviewScreen } from "./screens/ClosingReviewScreen";
import { CaseClosedScreen } from "./screens/CaseClosedScreen";

export default function App() {
  const { screen, setScreen } = useScreen("dashboard");
  const { messages, loading: chatLoading, send } = useChat();
  const [showBanner, setShowBanner] = useState(true);

  const [selectedSteps, setSelectedSteps] = useState<SuggestedStep[]>([]);
  const [selectedRedirectId, setSelectedRedirectId] = useState<string>("");
  const [skippedSteps, setSkippedSteps] = useState<SuggestedStep[]>([]);
  // Track which categories have been completed this session
  const [completedCategories, setCompletedCategories] = useState<string[]>([]);

  const navigateTo = (s: Screen, steps?: SuggestedStep[]) => {
    if (steps !== undefined) setSelectedSteps(steps);
    setScreen(s);
  };

  const markCategoryComplete = (category: string) => {
    setCompletedCategories((prev) =>
      prev.includes(category) ? prev : [...prev, category]
    );
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        {showBanner && <SubscribeBanner onClose={() => setShowBanner(false)} />}
        <TopNav />
        {screen === "dashboard" && <TabNav />}

        <div className="content">

          {screen === "dashboard" && (
            <DashboardScreen
              onNavigate={(s) => navigateTo(s)}
              completedCategories={completedCategories}
            />
          )}

          {screen === "detail" && (
            <DetailScreen
              onNavigate={(s) => navigateTo(s)}
              onStepsSelected={(steps) => setSelectedSteps(steps)}
              completedCategories={completedCategories}
            />
          )}

          {screen === "nextSteps" && (
            <NextStepsScreen
              onNavigate={(s) => navigateTo(s)}
              onStepsSelected={(steps) => setSelectedSteps(steps)}
            />
          )}

          {screen === "actionChoice" && (
            <ActionChoiceScreen
              selectedSteps={selectedSteps}
              onNavigate={(s) => navigateTo(s)}
              onDoItMyself={(steps) => navigateTo("doItMyself", steps)}
              onTakeAction={(steps) => {
                // Subscriptions → full take action flow
                // Payroll → payroll summary only
                if (steps[0]?.category === "payroll") {
                  navigateTo("payrollSummary", steps);
                } else {
                  navigateTo("takeAction", steps);
                }
              }}
            />
          )}

          {screen === "payrollSummary" && (
            <PayrollSummaryScreen
              onNavigate={(s) => navigateTo(s)}
              onFinish={() => {
                markCategoryComplete("payroll");
                navigateTo("caseClosed");
              }}
            />
          )}

          {screen === "actionConfirmation" && (
            <ActionConfirmationScreen
              selectedSteps={selectedSteps}
              onNavigate={(s) => navigateTo(s)}
              onFinish={(skipped) => {
                setSkippedSteps(skipped);
                markCategoryComplete(selectedSteps[0]?.category ?? "");
                navigateTo(skipped.length > 0 ? "closingReview" : "caseClosed");
              }}
            />
          )}

          {screen === "doItMyself" && (
            <DoItMyselfScreen
              selectedSteps={selectedSteps}
              onNavigate={(s) => navigateTo(s)}
              onFinish={(skipped) => {
                setSkippedSteps(skipped);
                markCategoryComplete(selectedSteps[0]?.category ?? "");
                navigateTo(skipped.length > 0 ? "closingReview" : "caseClosed");
              }}
            />
          )}

          {screen === "takeAction" && (
  <TakeActionScreen
    selectedSteps={selectedSteps}
    onNavigate={(s) => navigateTo(s)}
    onFinish={(skipped) => {
      setSkippedSteps(skipped);
      markCategoryComplete(selectedSteps[0]?.category ?? "");
      navigateTo(skipped.length > 0 ? "closingReview" : "caseClosed");
    }}
  />
)}

          {screen === "cashRedirects" && (
            <CashRedirectsScreen
              onNavigate={(s) => navigateTo(s)}
              onRedirectSelected={setSelectedRedirectId}
            />
          )}

          {screen === "redirectImpact" && (
            <RedirectImpactScreen
              redirectId={selectedRedirectId}
              selectedSteps={selectedSteps}
              onNavigate={(s) => navigateTo(s)}
              onFinish={(skipped) => {
                setSkippedSteps(skipped);
                markCategoryComplete(selectedSteps[0]?.category ?? "");
                navigateTo(skipped.length > 0 ? "closingReview" : "caseClosed");
              }}
            />
          )}

          {screen === "closingReview" && (
            <ClosingReviewScreen
              skippedSteps={skippedSteps}
              onNavigate={(s) => navigateTo(s)}
              onSkipAndFinish={() => navigateTo("caseClosed")}
              onApplySelected={(step) => navigateTo("actionChoice", [step])}
            />
          )}

          {screen === "caseClosed" && (
            <CaseClosedScreen
              onNavigate={(s) => navigateTo(s)}
              stepsTaken={selectedSteps}
              stepsSkipped={skippedSteps}
              completedCategories={completedCategories}
              onStartNewCase={(step) => {
                // Start a new case — route payroll to summary, subscriptions to full flow
                if (step.category === "payroll") {
                  navigateTo("payrollSummary", [step]);
                } else {
                  navigateTo("actionChoice", [step]);
                }
              }}
            />
          )}

          {screen === "archived" && (
            <ArchivedCasesScreen onNavigate={(s) => navigateTo(s)} />
          )}

        </div>
      </div>

      <ChatDrawer
        messages={messages}
        loading={chatLoading}
        onSend={send}
        autoOpen={true}
        userName="Angela"
        issueCount={2}
      />
    </div>
  );
}