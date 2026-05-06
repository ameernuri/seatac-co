export type SeoAutonomyReadinessInput = {
  seeded: boolean;
  audited: boolean;
  searchConsole: boolean;
  rankSnapshots: boolean;
  changeLogs: boolean;
  experiments: boolean;
  templateFamilyCount: number;
  trackedPageCount: number;
  trackedKeywordCount: number;
  latestDailyRunExists: boolean;
  activeAgentRuns: number;
  failedAgentRuns: number;
  staleAgentRuns: number;
  blockedAgentRuns: number;
  awaitingApprovalRuns: number;
  qaBlockedCount: number;
  qaApprovedCount: number;
  activeAlertCount: number;
  highAlertCount: number;
  backlogAwaitingDeployCount: number;
  deployConfigured: boolean;
};

export type SeoAutonomyStage = {
  key: string;
  label: string;
  status: "ready" | "partial" | "blocked" | "not_needed";
  ready: boolean;
  metric: string;
  hint: string;
};

export type SeoAutonomyBlocker = {
  key: string;
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
  action: string;
};

export type SeoAutonomyReadiness = {
  score: number;
  status: "ready" | "partial" | "blocked";
  canRunUnattended: boolean;
  summary: string;
  nextStep: string;
  blockers: SeoAutonomyBlocker[];
  stages: SeoAutonomyStage[];
  fullAutonomyReady: boolean;
  fullAutonomySummary: string;
  fullAutonomyBlockers: SeoAutonomyBlocker[];
};

function pushBlocker(
  blockers: SeoAutonomyBlocker[],
  blocker: SeoAutonomyBlocker | null,
) {
  if (blocker) {
    blockers.push(blocker);
  }
}

export function buildSeoAutonomyReadiness(
  input: SeoAutonomyReadinessInput,
): SeoAutonomyReadiness {
  const blockers: SeoAutonomyBlocker[] = [];

  pushBlocker(
    blockers,
    !input.latestDailyRunExists
      ? {
          key: "daily_cycle_missing",
          severity: "high",
          title: "Daily cadence is not running",
          detail:
            "The loop has no recent daily-cycle memory, so observation, refreshes, and alert upkeep are not guaranteed.",
          action: "Run seo:cycle:daily and keep the supervisor on a recurring schedule.",
        }
      : null,
  );

  pushBlocker(
    blockers,
    !input.searchConsole
      ? {
          key: "search_console_missing",
          severity: "high",
          title: "Search Console is not connected",
          detail:
            "The loop does not have live Google impressions, clicks, or average position, so content learning is incomplete.",
          action: "Configure GSC credentials and run seo:gsc-sync.",
        }
      : null,
  );

  pushBlocker(
    blockers,
    !input.rankSnapshots
      ? {
          key: "rank_snapshots_missing",
          severity: "high",
          title: "Rank tracking is incomplete",
          detail:
            "Tracked keywords are missing baseline or synced rank snapshots, so ranking movement cannot be trusted.",
          action: "Run seo:rank:sync or import baseline ranks for the tracked keyword set.",
        }
      : null,
  );

  pushBlocker(
    blockers,
    input.failedAgentRuns > 0
      ? {
          key: "failed_agent_runs",
          severity: "high",
          title: "Agent failures need cleanup",
          detail: `${input.failedAgentRuns} recent agent run(s) failed, which breaks unattended operation.`,
          action: "Review the failed packets, resolve the cause, and complete or retry those runs.",
        }
      : null,
  );

  pushBlocker(
    blockers,
    input.staleAgentRuns > 0
      ? {
          key: "stale_agent_runs",
          severity: "medium",
          title: "Stale leases are present",
          detail: `${input.staleAgentRuns} agent run(s) expired without completion, so the queue may be artificially blocked.`,
          action: "Review the stale runs and sweep them with seo:agent:sweep-stale if appropriate.",
        }
      : null,
  );

  pushBlocker(
    blockers,
    input.blockedAgentRuns > 0
      ? {
          key: "blocked_agent_runs",
          severity: "medium",
          title: "Some work packets are blocked",
          detail: `${input.blockedAgentRuns} agent run(s) currently require operator intervention before the loop can continue cleanly.`,
          action: "Open the blocked runs, record the blocker resolution, and move them forward.",
        }
      : null,
  );

  pushBlocker(
    blockers,
    input.qaBlockedCount > 0
      ? {
          key: "qa_blockers",
          severity: "medium",
          title: "QA blockers are preventing promotion",
          detail: `${input.qaBlockedCount} latest QA target(s) are blocked or marked for revision.`,
          action: "Resolve the QA findings or add an explicit manual approval note.",
        }
      : null,
  );

  pushBlocker(
    blockers,
    input.backlogAwaitingDeployCount > 0 && !input.deployConfigured
      ? {
          key: "deploy_not_configured",
          severity: "high",
          title: "Static deploy automation is not configured",
          detail: `${input.backlogAwaitingDeployCount} approved static content item(s) are waiting in awaiting_deploy, but the executor has no SEO_DEPLOY_COMMAND.`,
          action: "Configure SEO_DEPLOY_COMMAND and SEO_DEPLOY_WORKDIR so approved static changes can ship automatically.",
        }
      : null,
  );

  pushBlocker(
    blockers,
    input.highAlertCount > 0
      ? {
          key: "high_alerts_open",
          severity: "medium",
          title: "High-severity loop alerts are open",
          detail: `${input.highAlertCount} high-severity alert(s) are still open in loop memory.`,
          action: "Clear the open high-severity alerts before trusting unattended operation.",
        }
      : null,
  );

  const essentialSignalsReady =
    input.seeded &&
    input.audited &&
    input.searchConsole &&
    input.rankSnapshots &&
    input.changeLogs;

  const agentLaneHealthy =
    input.latestDailyRunExists &&
    input.failedAgentRuns === 0 &&
    input.staleAgentRuns === 0 &&
    input.blockedAgentRuns === 0;

  const deployLaneReady =
    input.backlogAwaitingDeployCount === 0 || input.deployConfigured;

  const canRunUnattended =
    essentialSignalsReady &&
    agentLaneHealthy &&
    input.highAlertCount === 0 &&
    deployLaneReady;

  const fullAutonomyBlockers: SeoAutonomyBlocker[] = [];
  pushBlocker(
    fullAutonomyBlockers,
    !input.deployConfigured
      ? {
          key: "full_autonomy_deploy_config_missing",
          severity: "high",
          title: "Deploy command is still missing",
          detail:
            "The loop can only be fully autonomous for supported static changes when a real deploy command is configured ahead of time.",
          action: "Set SEO_DEPLOY_COMMAND and SEO_DEPLOY_WORKDIR for the production deploy path.",
        }
      : null,
  );
  pushBlocker(
    fullAutonomyBlockers,
    input.awaitingApprovalRuns > 0
      ? {
          key: "full_autonomy_operator_queue_not_empty",
          severity: "medium",
          title: "Operator approval queue is not empty",
          detail: `${input.awaitingApprovalRuns} draft run(s) are still sitting in the human handoff lane.`,
          action: "Clear the existing approval queue or change the policy for those targets before calling the loop fully autonomous.",
        }
      : null,
  );
  if (!canRunUnattended) {
    for (const blocker of blockers) {
      if (!fullAutonomyBlockers.some((item) => item.key === blocker.key)) {
        fullAutonomyBlockers.push(blocker);
      }
    }
  }
  const fullAutonomyReady =
    canRunUnattended && input.deployConfigured && input.awaitingApprovalRuns === 0;

  const stages: SeoAutonomyStage[] = [
    {
      key: "memory",
      label: "Memory foundation",
      status:
        input.seeded && input.templateFamilyCount > 0 && input.changeLogs
          ? "ready"
          : input.seeded
            ? "partial"
            : "blocked",
      ready: input.seeded && input.templateFamilyCount > 0 && input.changeLogs,
      metric: `${input.trackedPageCount} pages • ${input.trackedKeywordCount} keywords • ${input.templateFamilyCount} templates`,
      hint: "Pages, keywords, templates, and change memory must exist before the loop can improve anything coherently.",
    },
    {
      key: "signals",
      label: "Search signals",
      status:
        input.audited && input.searchConsole && input.rankSnapshots
          ? "ready"
          : input.audited || input.searchConsole || input.rankSnapshots
            ? "partial"
            : "blocked",
      ready: input.audited && input.searchConsole && input.rankSnapshots,
      metric: `${input.audited ? 1 : 0}/1 audit • ${input.searchConsole ? 1 : 0}/1 GSC • ${input.rankSnapshots ? 1 : 0}/1 rank feed`,
      hint: "Fast audits and slow Google/rank feedback both need to be present for good prioritization.",
    },
    {
      key: "agent_lane",
      label: "Agent lane",
      status: agentLaneHealthy ? "ready" : input.latestDailyRunExists ? "partial" : "blocked",
      ready: agentLaneHealthy,
      metric: `${input.activeAgentRuns} running • ${input.failedAgentRuns} failed • ${input.staleAgentRuns} stale • ${input.blockedAgentRuns} blocked`,
      hint: "OpenClaw should be able to observe, research, and draft without accumulating stale or failed packets.",
    },
    {
      key: "approval_lane",
      label: "Approval lane",
      status:
        input.qaBlockedCount === 0
          ? input.awaitingApprovalRuns > 0
            ? "partial"
            : "ready"
          : "blocked",
      ready: input.qaBlockedCount === 0,
      metric: `${input.qaApprovedCount} approved QA • ${input.awaitingApprovalRuns} awaiting operator`,
      hint: "Human approval remains part of the loop, but the approval queue should stay clear and QA should not be blocking.",
    },
    {
      key: "deploy_lane",
      label: "Deploy lane",
      status:
        input.backlogAwaitingDeployCount === 0
          ? "not_needed"
          : input.deployConfigured
            ? "ready"
            : "blocked",
      ready: input.backlogAwaitingDeployCount === 0 || input.deployConfigured,
      metric:
        input.backlogAwaitingDeployCount === 0
          ? "No static deploy backlog"
          : `${input.backlogAwaitingDeployCount} awaiting deploy • executor ${input.deployConfigured ? "configured" : "missing"}`,
      hint: "Approved static changes are only autonomous if the deploy executor can actually ship them.",
    },
    {
      key: "autonomy",
      label: "Unattended readiness",
      status: canRunUnattended ? "ready" : blockers.some((item) => item.severity === "high") ? "blocked" : "partial",
      ready: canRunUnattended,
      metric: `${input.activeAlertCount} active alerts • ${input.highAlertCount} high severity`,
      hint: "This stage answers whether the loop can keep progressing safely between operator sessions.",
    },
  ];

  const stageWeights: Record<SeoAutonomyStage["status"], number> = {
    ready: 100,
    partial: 60,
    blocked: 20,
    not_needed: 100,
  };
  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        stages.reduce((sum, stage) => sum + stageWeights[stage.status], 0) / stages.length,
      ),
    ),
  );

  const status: SeoAutonomyReadiness["status"] = canRunUnattended
    ? "ready"
    : blockers.some((item) => item.severity === "high")
      ? "blocked"
      : "partial";

  const summary =
    status === "ready"
      ? "The loop can operate unattended for the currently supported workflows."
      : status === "blocked"
        ? "The loop is partially autonomous, but one or more hard blockers still prevent safe unattended operation."
        : "The loop is usable, but the remaining gaps still require predictable operator follow-through.";

  return {
    score,
    status,
    canRunUnattended,
    summary,
    nextStep:
      blockers[0]?.action ?? "Keep the daily cycle and supervisor running, then work the highest-signal backlog item.",
    blockers,
    stages,
    fullAutonomyReady,
    fullAutonomySummary: fullAutonomyReady
      ? "The loop is fully configured to keep supported SEO workflows moving without operator intervention."
      : "The loop can run unattended for supported work, but it is not yet fully autonomous end to end.",
    fullAutonomyBlockers,
  };
}
