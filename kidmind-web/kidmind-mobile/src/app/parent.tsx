import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from "react-native";

import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Activity,
  BarChart3,
  Bell,
  Brain,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Download,
  Eye,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Pencil,
  RefreshCw,
  Settings,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserRound,
  Users,
  X,
} from "lucide-react-native";

import {
  authRequest,
  clearAuthSession,
  getCurrentUser,
  type AuthUser,
} from "../api/authApi";

import MobileSettings from "@/components/settings/MobileSettings";
import MobileChat from "@/components/chat/MobileChat";
import UserAvatar from "@/components/common/UserAvatar";
import ParentNotificationsSection from "@/components/notifications/ParentNotificationsSection";
import ParentFeedback from "@/components/parent/ParentFeedback";

import {
  downloadParentReportPdf,
} from "@/utils/reportPdf";

import {
  calculateCognitiveScore,
  domainConfigs,
  getAverageSessionScore,
  getCognitiveDomains,
  getLatestCompletedAssessment,
  normalizeGameName,
  type CognitiveSession,
  type SessionGame,
} from "../utils/cognitiveScores";

type ParentChild = {
  id: number;
  full_name: string;
  age?: number | null;
  gender?: string | null;
  parent_name?: string | null;
  region?: string | null;
  status?: string | null;
};

type ParentTherapist = {
  id: number;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  is_active?: number | boolean;
  child_id: number;
  child_name?: string | null;
};

type ParentGame = SessionGame;

type ParentSession = CognitiveSession & {
  id: number;
  child_id: number;
  child_name?: string | null;
  child_age?: number | null;
  child_gender?: string | null;
  child_region?: string | null;
  game_name?: string | null;
  difficulty?: string | null;
  scheduled_at?: string | null;
  games?: ParentGame[];
};

type ParentSessionsResponse = {
  sessions: ParentSession[];
};

type SectionKey =
  | "overview"
  | "children"
  | "sessions"
  | "reports"
  | "progress"
  | "messages"
  | "notifications"
  | "feedback"
  | "settings";

type IconComponent = ComponentType<{
  size?: number;
  color?: string;
}>;

const REPORTABLE_STATUSES = new Set(["Completed", "Ended"]);
const DOMAINS = domainConfigs.map((domain) => domain.label);

const menuItems: {
  key: SectionKey;
  title: string;
  icon: IconComponent;
}[] = [
  { key: "overview", title: "Overview", icon: LayoutDashboard },
  { key: "children", title: "My Children", icon: Users },
  { key: "sessions", title: "Sessions", icon: CalendarDays },
  { key: "reports", title: "Reports", icon: FileText },
  { key: "progress", title: "Progress", icon: BarChart3 },
  { key: "messages", title: "Messages", icon: MessageCircle },
  { key: "notifications", title: "Notifications", icon: Bell },
  { key: "feedback", title: "Feedback", icon: ClipboardList },
  { key: "settings", title: "Settings", icon: Settings },
];

const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
};

const getSessionDate = (session: ParentSession) =>
  parseDate(session.ended_at) ||
  parseDate(session.started_at) ||
  parseDate(session.updated_at) ||
  parseDate(session.created_at);

const formatDate = (value?: string | null) => {
  const date = parseDate(value);
  if (!date) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatAssessmentDate = (session: CognitiveSession | null) => {
  if (!session) return "Not assessed";

  return formatDate(
    session.ended_at ||
      session.updated_at ||
      session.started_at ||
      session.created_at
  );
};

const formatDuration = (session: ParentSession) => {
  const seconds = Number(session.duration_seconds ?? 0);

  if (!Number.isFinite(seconds) || seconds <= 0) return "—";

  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60);

  return `${minutes}m ${remaining}s`;
};

const getSessionScore = (session: ParentSession): number | null => {
  const rawScore = session.score;

  if (rawScore !== null && rawScore !== undefined && rawScore !== "") {
    const score = Number(rawScore);

    if (Number.isFinite(score)) {
      return Math.max(0, Math.min(100, Math.round(score)));
    }
  }

  const games = Array.isArray(session.games) ? session.games : [];

  const scores = games
    .filter(
      (game) => game.status === "Completed" || game.status === "Failed"
    )
    .map((game) => {
      if (
        game.score === null ||
        game.score === undefined ||
        game.score === ""
      ) {
        return null;
      }

      const score = Number(game.score);
      return Number.isFinite(score) ? score : null;
    })
    .filter((score): score is number => score !== null);

  if (!scores.length) return null;

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        scores.reduce((total, score) => total + score, 0) / scores.length
      )
    )
  );
};

const getDomainName = (game: ParentGame): string | null => {
  const gameName = normalizeGameName(game.game_name || game.name);

  const domain = domainConfigs.find(
    (item) => normalizeGameName(item.gameName) === gameName
  );

  return domain?.label || null;
};

const getGameScore = (game: ParentGame): number | null => {
  if (
    game.score === null ||
    game.score === undefined ||
    game.score === ""
  ) {
    return null;
  }

  const score = Number(game.score);
  if (!Number.isFinite(score)) return null;

  return Math.max(0, Math.min(100, Math.round(score)));
};

const getInitials = (name?: string | null) =>
  String(name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const statusTheme = (status?: string | null) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "completed") {
    return { backgroundColor: "#E9F8F1", color: "#3E9272" };
  }

  if (normalized === "ended") {
    return { backgroundColor: "#EDF2FF", color: "#5A73BD" };
  }

  if (normalized === "cancelled") {
    return { backgroundColor: "#FFF0F2", color: "#C45D70" };
  }

  if (normalized === "in progress") {
    return { backgroundColor: "#FFF7DF", color: "#A17B23" };
  }

  return { backgroundColor: "#F1F1F5", color: "#797A8C" };
};

export default function Parent() {

  const params =
    useLocalSearchParams<{
      section?:
        | string
        | string[];
    }>();


  const [activeSection, setActiveSection] =
    useState<SectionKey>("overview");
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [sessions, setSessions] = useState<ParentSession[]>([]);
  const [therapists, setTherapists] = useState<ParentTherapist[]>([]);
  const [selectedChildId, setSelectedChildId] =
    useState<number | null>(null);
  const [currentUser, setCurrentUser] =
    useState<AuthUser | null>(getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedReport, setSelectedReport] =
    useState<ParentSession | null>(null);
  const [editingChild, setEditingChild] =
    useState<ParentChild | null>(null);

  const loadData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      setError("");

      const [loadedChildren, loadedSessions, loadedTherapists] =
        await Promise.all([
          authRequest<ParentChild[]>("/users/parent/children"),
          authRequest<ParentSessionsResponse>("/sessions/parent"),
          authRequest<ParentTherapist[]>("/users/parent/therapists"),
        ]);

      const safeChildren = Array.isArray(loadedChildren)
        ? loadedChildren
        : [];

      const safeSessions = Array.isArray(loadedSessions?.sessions)
        ? loadedSessions.sessions
        : [];

      const safeTherapists = Array.isArray(loadedTherapists)
        ? loadedTherapists
        : [];

      setChildren(safeChildren);
      setSessions(safeSessions);
      setTherapists(safeTherapists);
      setCurrentUser(getCurrentUser());

      setSelectedChildId((current) => {
        if (
          current !== null &&
          safeChildren.some((child) => child.id === current)
        ) {
          return current;
        }

        return safeChildren[0]?.id ?? null;
      });
    } catch (requestError) {
      console.error("Parent dashboard error:", requestError);

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load parent dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  useEffect(
    () => {

      const rawSection =
        Array.isArray(
          params.section
        )
          ? params.section[0]
          : params.section;


      if (
        rawSection &&
        menuItems.some(
          item =>
            item.key ===
            rawSection
        )
      ) {
        setActiveSection(
          rawSection as SectionKey
        );
      }

    },
    [
      params.section,
    ]
  );


  const selectedChild = useMemo(
    () =>
      children.find((child) => child.id === selectedChildId) ||
      children[0] ||
      null,
    [children, selectedChildId]
  );

  const childSessions = useMemo(() => {
    if (!selectedChild) return [];

    return sessions
      .filter((session) => session.child_id === selectedChild.id)
      .sort((first, second) => {
        const firstTime = getSessionDate(first)?.getTime() || 0;
        const secondTime = getSessionDate(second)?.getTime() || 0;
        return secondTime - firstTime;
      });
  }, [sessions, selectedChild]);

  const reportableSessions = useMemo(
    () =>
      childSessions.filter((session) =>
        REPORTABLE_STATUSES.has(String(session.status))
      ),
    [childSessions]
  );

  const currentCognitiveScore = useMemo(
    () => calculateCognitiveScore(childSessions),
    [childSessions]
  );

  const averageSessionScore = useMemo(
    () => getAverageSessionScore(childSessions),
    [childSessions]
  );

  const latestAssessment = useMemo(
    () => getLatestCompletedAssessment(childSessions),
    [childSessions]
  );

  const currentDomains = useMemo(
    () => getCognitiveDomains(childSessions),
    [childSessions]
  );

  const childTherapists = useMemo(() => {
    if (!selectedChild) return [];

    return therapists.filter(
      (therapist) => therapist.child_id === selectedChild.id
    );
  }, [therapists, selectedChild]);

  const availableDomainScores = currentDomains.filter(
    (item) => typeof item.score === "number"
  );

  const strongestArea = availableDomainScores.length
    ? [...availableDomainScores].sort(
        (a, b) => Number(b.score) - Number(a.score)
      )[0]
    : null;

  const areaToWatch = availableDomainScores.length
    ? [...availableDomainScores].sort(
        (a, b) => Number(a.score) - Number(b.score)
      )[0]
    : null;

  const progressRows = useMemo(() => {
    const history: Record<
      string,
      { score: number; date: Date | null }[]
    > = {};

    DOMAINS.forEach((domain) => {
      history[domain] = [];
    });

    childSessions.forEach((session) => {
      const games = Array.isArray(session.games) ? session.games : [];

      games.forEach((game) => {
        if (
          game.status !== "Completed" &&
          game.status !== "Failed"
        ) {
          return;
        }

        const domain = getDomainName(game);
        const score = getGameScore(game);

        if (!domain || score === null) return;

        const date =
          parseDate(game.ended_at) ||
          parseDate(game.started_at) ||
          parseDate(game.updated_at) ||
          parseDate(game.created_at) ||
          getSessionDate(session);

        history[domain].push({ score, date });
      });
    });

    DOMAINS.forEach((domain) => {
      history[domain].sort(
        (a, b) =>
          (b.date?.getTime() || 0) - (a.date?.getTime() || 0)
      );
    });

    return DOMAINS.map((domain) => {
      const items = history[domain] || [];
      const latest = items[0]?.score ?? null;
      const previous = items[1]?.score ?? null;
      const change =
        latest !== null && previous !== null
          ? latest - previous
          : null;

      return { domain, latest, previous, change };
    });
  }, [childSessions]);

  const latestActivity = childSessions[0] || null;

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/login");
  };

  const changeSection = (section: SectionKey) => {
    setActiveSection(section);
    setDrawerVisible(false);

    router.setParams({
      section,
    });
  };

  const renderHeader = (title: string, subtitle: string) => (
    <View style={styles.sectionHeader}>
      <View style={styles.flexOne}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>

      <Pressable
        onPress={() => loadData(false)}
        disabled={refreshing}
        style={styles.refreshButton}
      >
        {refreshing ? (
          <ActivityIndicator size="small" color="#6B5BC3" />
        ) : (
          <RefreshCw size={17} color="#6B5BC3" />
        )}
      </Pressable>
    </View>
  );

  const renderChildSelector = () => {
    if (children.length <= 1) return null;

    return (
      <View style={styles.selectorSection}>
        <Text style={styles.selectorLabel}>Viewing child</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectorScroll}
        >
          {children.map((child) => {
            const active = child.id === selectedChildId;

            return (
              <Pressable
                key={child.id}
                onPress={() => setSelectedChildId(child.id)}
                style={[
                  styles.selectorChip,
                  active && styles.selectorChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.selectorChipText,
                    active && styles.selectorChipTextActive,
                  ]}
                >
                  {child.full_name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderOverview = () => {
    if (!selectedChild) {
      return (
        <EmptyState
          icon={Users}
          title="No children assigned"
          message="There are currently no children linked to this parent account."
        />
      );
    }

    return (
      <>
        {renderHeader(
          `Welcome, ${currentUser?.full_name || "Parent"}`,
          `Here is ${selectedChild.full_name}'s latest KidMind overview.`
        )}

        {renderChildSelector()}

        <View style={styles.childHero}>
          <View style={styles.largeAvatar}>
            <Text style={styles.largeAvatarText}>
              {getInitials(selectedChild.full_name)}
            </Text>
          </View>

          <View style={styles.childHeroInfo}>
            <Text style={styles.eyebrow}>CHILD PROFILE</Text>
            <Text style={styles.childHeroName}>
              {selectedChild.full_name}
            </Text>

            <View style={styles.metaWrap}>
              <MetaChip text={`Age ${selectedChild.age ?? "—"}`} />
              <MetaChip text={selectedChild.gender || "—"} />
              <MetaChip text={selectedChild.status || "Active"} />
              <MetaChip
                text={`Latest: ${formatAssessmentDate(
                  latestAssessment
                )}`}
              />
            </View>
          </View>

          <View style={styles.therapistSummary}>
            <Text style={styles.smallLabel}>Assigned Therapist</Text>
            <Text style={styles.therapistSummaryName}>
              {childTherapists.length
                ? childTherapists
                    .map((therapist) => therapist.full_name)
                    .join(", ")
                : "Not assigned"}
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon={Brain}
            iconBackground="#EEEAFF"
            iconColor="#6F5EC9"
            title="Current Cognitive Score"
            value={
              currentCognitiveScore !== null
                ? `${currentCognitiveScore}%`
                : "—"
            }
            subtitle="Latest score across cognitive areas"
          />

          <StatCard
            icon={BarChart3}
            iconBackground="#FFEDF4"
            iconColor="#C35E85"
            title="Average Session Score"
            value={
              averageSessionScore !== null
                ? `${averageSessionScore}%`
                : "—"
            }
            subtitle="Historical completed session average"
          />

          <StatCard
            icon={CheckCircle2}
            iconBackground="#EAF3FF"
            iconColor="#4E80C8"
            title="Reports"
            value={String(reportableSessions.length)}
            subtitle="Completed and ended"
          />

          <StatCard
            icon={CalendarDays}
            iconBackground="#E9F8F1"
            iconColor="#4D9B7C"
            title="Total Sessions"
            value={String(childSessions.length)}
            subtitle="Recorded sessions"
          />
        </View>

        <Panel>
          <PanelHeader
            title="Child Snapshot"
            subtitle="Based on the latest available cognitive-domain scores"
            icon={Sparkles}
          />

          <View style={styles.snapshotGrid}>
            <View style={[styles.snapshotCard, styles.positiveCard]}>
              <View style={styles.snapshotIcon}>
                <TrendingUp size={20} color="#419779" />
              </View>

              <View style={styles.flexOne}>
                <Text style={styles.smallLabel}>Strongest Area</Text>
                <Text style={styles.snapshotTitle}>
                  {strongestArea
                    ? strongestArea.label
                    : "Not enough data"}
                </Text>

                {strongestArea && (
                  <Text style={styles.snapshotSmall}>
                    {strongestArea.score}% latest score
                  </Text>
                )}
              </View>
            </View>

            <View style={[styles.snapshotCard, styles.attentionCard]}>
              <View style={styles.snapshotIcon}>
                <TrendingDown size={20} color="#CF6B72" />
              </View>

              <View style={styles.flexOne}>
                <Text style={styles.smallLabel}>Area to Watch</Text>
                <Text style={styles.snapshotTitle}>
                  {areaToWatch
                    ? areaToWatch.label
                    : "Not enough data"}
                </Text>

                {areaToWatch && (
                  <Text style={styles.snapshotSmall}>
                    {areaToWatch.score}% latest score
                  </Text>
                )}
              </View>
            </View>
          </View>
        </Panel>

        <Panel>
          <PanelHeader
            title="Latest Activity"
            subtitle="Most recent recorded session"
            icon={Activity}
          />

          {latestActivity ? (
            <View style={styles.activityCard}>
              <View style={styles.activityTop}>
                <Text style={styles.activityLabel}>
                  Session #{latestActivity.id}
                </Text>
                <StatusPill status={latestActivity.status} />
              </View>

              <View style={styles.activityDetails}>
                <View style={styles.iconTextRow}>
                  <CalendarDays size={15} color="#83849B" />
                  <Text style={styles.activityDetailText}>
                    {formatDate(
                      latestActivity.ended_at ||
                        latestActivity.started_at ||
                        latestActivity.created_at
                    )}
                  </Text>
                </View>

                <View style={styles.iconTextRow}>
                  <Clock3 size={15} color="#83849B" />
                  <Text style={styles.activityDetailText}>
                    {formatDuration(latestActivity)}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={styles.miniEmpty}>No activity yet.</Text>
          )}
        </Panel>

        <Panel>
          <View style={styles.panelHeader}>
            <View style={styles.flexOne}>
              <Text style={styles.panelTitle}>Recent Reports</Text>
              <Text style={styles.panelSubtitle}>
                Latest completed assessment results
              </Text>
            </View>

            <Pressable
              onPress={() => setActiveSection("reports")}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>View all</Text>
            </Pressable>
          </View>

          {reportableSessions.length ? (
            reportableSessions.slice(0, 5).map((session) => (
              <RecentReportRow
                key={session.id}
                session={session}
                onView={() => setSelectedReport(session)}
              />
            ))
          ) : (
            <Text style={styles.miniEmpty}>
              No reports are available yet.
            </Text>
          )}
        </Panel>
      </>
    );
  };

  const renderChildren = () => (
    <>
      {renderHeader(
        "My Children",
        "View the children linked to your parent account."
      )}

      {children.length ? (
        children.map((child) => {
          const linkedTherapists = therapists.filter(
            (therapist) => therapist.child_id === child.id
          );

          const sessionsForChild = sessions.filter(
            (session) => session.child_id === child.id
          );

          const score = calculateCognitiveScore(sessionsForChild);
          const assessment =
            getLatestCompletedAssessment(sessionsForChild);

          return (
            <View key={child.id} style={styles.childCard}>
              <View style={styles.childCardTop}>
                <View style={styles.childCardAvatar}>
                  <Text style={styles.childCardAvatarText}>
                    {getInitials(child.full_name)}
                  </Text>
                </View>

                <View style={styles.flexOne}>
                  <Text style={styles.childCardName}>
                    {child.full_name}
                  </Text>
                  <Text style={styles.childCardMeta}>
                    Age {child.age ?? "—"} · {child.gender || "—"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoGrid}>
                <InfoItem
                  label="Status"
                  value={child.status || "Active"}
                />
                <InfoItem
                  label="Latest Assessment"
                  value={formatAssessmentDate(assessment)}
                />
                <InfoItem
                  label="Current Score"
                  value={score !== null ? `${score}%` : "—"}
                />
                <InfoItem
                  label="Therapist"
                  value={
                    linkedTherapists.length
                      ? linkedTherapists
                          .map((therapist) => therapist.full_name)
                          .join(", ")
                      : "Not assigned"
                  }
                />
              </View>

              <View style={styles.childActions}>
                <Pressable
                  style={styles.primarySoftButton}
                  onPress={() => {
                    setSelectedChildId(child.id);
                    setActiveSection("overview");
                  }}
                >
                  <Text style={styles.primarySoftText}>
                    View Overview
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.editButton}
                  onPress={() => setEditingChild(child)}
                >
                  <Pencil size={18} color="#4F7FD8" />
                </Pressable>
              </View>
            </View>
          );
        })
      ) : (
        <EmptyState
          icon={Users}
          title="No children assigned"
          message="No children are currently linked to your account."
        />
      )}
    </>
  );

  const renderSessions = () => (
    <>
      {renderHeader(
        "Sessions",
        "View your child's recorded KidMind sessions."
      )}

      {renderChildSelector()}

      <Panel>
        {childSessions.length ? (
          childSessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionTop}>
                <View style={styles.sessionNumber}>
                  <Text style={styles.sessionNumberText}>
                    #{session.id}
                  </Text>
                </View>

                <View style={styles.flexOne}>
                  <Text style={styles.sessionTitle}>
                    Assessment Session
                  </Text>
                  <Text style={styles.sessionDate}>
                    {formatDate(
                      session.ended_at ||
                        session.started_at ||
                        session.created_at
                    )}
                  </Text>
                </View>

                <StatusPill status={session.status} />
              </View>

              <View style={styles.sessionInfoGrid}>
                <InfoItem
                  label="Duration"
                  value={formatDuration(session)}
                />
                <InfoItem
                  label="Games"
                  value={String(
                    Array.isArray(session.games)
                      ? session.games.length
                      : 0
                  )}
                />
                <InfoItem
                  label="Session Score"
                  value={
                    getSessionScore(session) !== null
                      ? `${getSessionScore(session)}%`
                      : "—"
                  }
                />
              </View>
            </View>
          ))
        ) : (
          <EmptyInsidePanel
            icon={CalendarDays}
            title="No sessions yet"
            message="No sessions have been recorded for this child."
          />
        )}
      </Panel>
    </>
  );

  const renderReports = () => (
    <>
      {renderHeader(
        "Reports",
        "Review completed session results and game details."
      )}

      {renderChildSelector()}

      {reportableSessions.length ? (
        reportableSessions.map((session) => {
          const score = getSessionScore(session);

          return (
            <View key={session.id} style={styles.reportCard}>
              <View style={styles.reportTop}>
                <View style={styles.reportIcon}>
                  <FileText size={21} color="#705EC9" />
                </View>

                <StatusPill status={session.status} />
              </View>

              <Text style={styles.reportTitle}>
                Session #{session.id}
              </Text>

              <Text style={styles.reportDate}>
                {formatDate(
                  session.ended_at ||
                    session.started_at ||
                    session.created_at
                )}
              </Text>

              <View style={styles.reportScore}>
                <Text style={styles.smallLabel}>Session Score</Text>
                <Text style={styles.reportScoreValue}>
                  {score !== null ? `${score}%` : "—"}
                </Text>
              </View>

              <View style={styles.reportMeta}>
                <View style={styles.iconTextRow}>
                  <Clock3 size={15} color="#87889C" />
                  <Text style={styles.reportMetaText}>
                    {formatDuration(session)}
                  </Text>
                </View>

                <View style={styles.iconTextRow}>
                  <Brain size={15} color="#87889C" />
                  <Text style={styles.reportMetaText}>
                    {Array.isArray(session.games)
                      ? session.games.length
                      : 0}{" "}
                    games
                  </Text>
                </View>
              </View>

              <Pressable
                style={styles.primarySoftButton}
                onPress={() => setSelectedReport(session)}
              >
                <Eye size={17} color="#6D59C8" />
                <Text style={styles.primarySoftText}>
                  View Report
                </Text>
              </Pressable>
            </View>
          );
        })
      ) : (
        <EmptyState
          icon={FileText}
          title="No reports yet"
          message="Completed assessment reports will appear here."
        />
      )}
    </>
  );

  const renderProgress = () => (
    <>
      {renderHeader(
        "Progress",
        "Track cognitive score changes from previous results."
      )}

      {renderChildSelector()}

      <Panel>
        <PanelHeader
          title="Cognitive Progress"
          subtitle="Latest result compared with the previous result in each area"
          icon={BarChart3}
        />

        {progressRows.map((row) => {
          const positive = row.change !== null && row.change > 0;
          const negative = row.change !== null && row.change < 0;

          const width =
            `${Math.max(
              0,
              Math.min(100, row.latest ?? 0)
            )}%` as `${number}%`;

          return (
            <View key={row.domain} style={styles.progressRow}>
              <View style={styles.progressHeader}>
                <View style={styles.flexOne}>
                  <Text style={styles.progressTitle}>
                    {row.domain}
                  </Text>
                  <Text style={styles.progressPrevious}>
                    Previous:{" "}
                    {row.previous !== null
                      ? `${row.previous}%`
                      : "—"}
                  </Text>
                </View>

                <View style={styles.progressValueWrap}>
                  <Text style={styles.progressValue}>
                    {row.latest !== null
                      ? `${row.latest}%`
                      : "—"}
                  </Text>

                  {row.change !== null && (
                    <View
                      style={[
                        styles.changeBadge,
                        positive
                          ? styles.changePositive
                          : negative
                          ? styles.changeNegative
                          : styles.changeNeutral,
                      ]}
                    >
                      <Text
                        style={[
                          styles.changeText,
                          positive
                            ? styles.changePositiveText
                            : negative
                            ? styles.changeNegativeText
                            : styles.changeNeutralText,
                        ]}
                      >
                        {positive ? "+" : ""}
                        {row.change}%
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width }]} />
              </View>
            </View>
          );
        })}
      </Panel>
    </>
  );

  const renderMessages = () => (
    <>
      {renderHeader(
        "Messages",
        "Communicate with therapists assigned to your child."
      )}

      {renderChildSelector()}

      <Panel>
        <PanelHeader
          title="Care Team"
          subtitle="Only therapists linked to this child will be available for messaging"
          icon={MessageCircle}
        />

        {childTherapists.length ? (
          childTherapists.map((therapist) => (
            <View
              key={`${therapist.id}-${therapist.child_id}`}
              style={styles.therapistCard}
            >
              <UserAvatar
                name={therapist.full_name}
                avatarUrl={therapist.avatar_url}
                style={styles.therapistAvatar}
                textStyle={styles.therapistAvatarText}
              />

              <View style={styles.flexOne}>
                <Text style={styles.therapistName}>
                  {therapist.full_name}
                </Text>
                <Text style={styles.therapistRole}>
                  Assigned Therapist
                </Text>
              </View>

              <View style={styles.comingSoonButton}>
                <Text style={styles.comingSoonText}>
                  Coming next
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.miniEmpty}>
            No therapist is currently assigned to this child.
          </Text>
        )}
      </Panel>
    </>
  );

  const renderNotifications = () => (
    <>
      {renderHeader(
        "Notifications",
        "Updates about reports, sessions, and care team activity."
      )}

      <ParentNotificationsSection />
    </>
  );

  const renderSettings = () => (
    <MobileSettings
      role="parent"
      onProfileUpdated={
        updatedUser => {
          setCurrentUser(
            updatedUser
          );
        }
      }
    />
  );

  const renderContent = () => {
    switch (activeSection) {
      case "children":
        return renderChildren();
      case "sessions":
        return renderSessions();
      case "reports":
        return renderReports();
      case "progress":
        return renderProgress();
      case "messages":
        return <MobileChat />;
      case "notifications":
        return renderNotifications();
      
      case "feedback":
  return <ParentFeedback />;
        case "settings":
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingPage}>
        <ActivityIndicator size="large" color="#7867D9" />
        <Text style={styles.loadingText}>
          Loading parent dashboard...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <View style={styles.container}>
        <View style={styles.topbar}>
          <Pressable
            style={styles.menuButton}
            onPress={() => setDrawerVisible(true)}
          >
            <Menu size={21} color="#72768F" />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.topUserRole}>
              Parent Portal
            </Text>

            <Text
              numberOfLines={1}
              style={styles.topUserName}
            >
              {currentUser?.full_name || "Parent"}
            </Text>
          </View>

          <View style={styles.avatarButton}>
            <UserAvatar
              name={currentUser?.full_name}
              avatarUrl={currentUser?.avatar_url}
              style={styles.topAvatar}
              textStyle={styles.topAvatarText}
            />
          </View>
        </View>

        {activeSection === "messages" ? (
          <View style={styles.chatContent}>
            {renderContent()}
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadData(false)}
                tintColor="#7867D9"
              />
            }
          >
            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {renderContent()}
          </ScrollView>
        )}
      </View>

      <Modal
        visible={drawerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDrawerVisible(false)}
      >
        <View style={styles.drawerBackdrop}>
          <Pressable
            style={styles.drawerDismiss}
            onPress={() => setDrawerVisible(false)}
          />

          <View style={styles.drawer}>
            <View style={styles.drawerTop}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.drawerLogo}
                resizeMode="contain"
              />

              <Pressable
                onPress={() => setDrawerVisible(false)}
                style={styles.drawerClose}
              >
                <X size={21} color="#77788F" />
              </Pressable>
            </View>

            <View style={styles.roleCard}>
              <View style={styles.roleIcon}>
                <UserRound size={19} color="#7565CF" />
              </View>

              <View>
                <Text style={styles.roleTitle}>Parent Portal</Text>
                <Text style={styles.roleSubtitle}>
                  KidMind Family View
                </Text>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.key;

                return (
                  <Pressable
                    key={item.key}
                    onPress={() => changeSection(item.key)}
                    style={[
                      styles.drawerMenuItem,
                      active && styles.drawerMenuItemActive,
                    ]}
                  >
                    <Icon
                      size={19}
                      color={active ? "#7465E8" : "#8A8EA5"}
                    />

                    <Text
                      style={[
                        styles.drawerMenuText,
                        active && styles.drawerMenuTextActive,
                      ]}
                    >
                      {item.title}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <LogOut size={19} color="#C1536E" />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {selectedReport && (
        <ReportModal
          session={selectedReport}
          close={() => setSelectedReport(null)}
        />
      )}

      {editingChild && (
        <EditChildModal
          child={editingChild}
          close={() => setEditingChild(null)}
          onSuccess={async () => {
            setEditingChild(null);
            await loadData(false);
          }}
        />
      )}
    </SafeAreaView>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return <View style={styles.panel}>{children}</View>;
}

function PanelHeader({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  icon: IconComponent;
}) {
  return (
    <View style={styles.panelHeader}>
      <View style={styles.flexOne}>
        <Text style={styles.panelTitle}>{title}</Text>
        <Text style={styles.panelSubtitle}>{subtitle}</Text>
      </View>
      <Icon size={22} color="#7563CC" />
    </View>
  );
}

function StatCard({
  icon: Icon,
  iconColor,
  iconBackground,
  title,
  value,
  subtitle,
}: {
  icon: IconComponent;
  iconColor: string;
  iconBackground: string;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <View style={styles.statCard}>
      <View
        style={[styles.statIcon, { backgroundColor: iconBackground }]}
      >
        <Icon size={22} color={iconColor} />
      </View>

      <View style={styles.flexOne}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function MetaChip({ text }: { text: string }) {
  return (
    <View style={styles.metaChip}>
      <Text style={styles.metaChipText}>{text}</Text>
    </View>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function InfoBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoBlock}>
      <Text style={styles.infoBlockLabel}>{label}</Text>
      <Text style={styles.infoBlockValue}>{value}</Text>
    </View>
  );
}

function StatusPill({ status }: { status?: string | null }) {
  const theme = statusTheme(status);

  return (
    <View
      style={[
        styles.statusPill,
        { backgroundColor: theme.backgroundColor },
      ]}
    >
      <Text style={[styles.statusText, { color: theme.color }]}>
        {status || "Unknown"}
      </Text>
    </View>
  );
}

function EmptyState({
  icon: Icon,
  title,
  message,
}: {
  icon: IconComponent;
  title: string;
  message: string;
}) {
  return (
    <View style={styles.emptyState}>
      <Icon size={34} color="#A2A2B3" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

function EmptyInsidePanel({
  icon: Icon,
  title,
  message,
}: {
  icon: IconComponent;
  title: string;
  message: string;
}) {
  return (
    <View style={styles.emptyInsidePanel}>
      <Icon size={34} color="#A2A2B3" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

function RecentReportRow({
  session,
  onView,
}: {
  session: ParentSession;
  onView: () => void;
}) {
  const score = getSessionScore(session);

  return (
    <View style={styles.recentReportRow}>
      <View style={styles.flexOne}>
        <Text style={styles.recentReportTitle}>
          Session #{session.id}
        </Text>
        <Text style={styles.recentReportDate}>
          {formatDate(
            session.ended_at ||
              session.started_at ||
              session.created_at
          )}
        </Text>
      </View>

      <View style={styles.recentScoreWrap}>
        <Text style={styles.recentScore}>
          {score !== null ? `${score}%` : "—"}
        </Text>
        <StatusPill status={session.status} />
      </View>

      <Pressable onPress={onView} style={styles.eyeButton}>
        <Eye size={17} color="#6F5BC9" />
      </Pressable>
    </View>
  );
}

function ReportModal({
  session,
  close,
}: {
  session: ParentSession;
  close: () => void;
}) {

  const [
    downloading,
    setDownloading,
  ] =
    useState(
      false
    );


  const sessionScore =
    getSessionScore(
      session
    );


  const reportDate =
    session.ended_at ||
    session.started_at ||
    session.created_at;


  const handleDownload =
    async () => {

      try {

        setDownloading(
          true
        );


        await downloadParentReportPdf(
          session
        );

      } catch (
        downloadError
      ) {

        Alert.alert(
          "PDF Error",
          downloadError instanceof
            Error
            ? downloadError.message
            : "Unable to create the PDF report."
        );

      } finally {

        setDownloading(
          false
        );

      }

    };


  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent
    >
      <View style={styles.modalBackdrop}>

        <View style={styles.parentReportModal}>

          <View style={styles.parentReportToolbar}>

            <View style={styles.parentReportToolbarCopy}>
              <Text style={styles.parentReportToolbarLabel}>
                KIDMIND REPORT
              </Text>

              <Text style={styles.parentReportToolbarTitle}>
                Assessment Report
              </Text>
            </View>


            <View style={styles.parentReportToolbarActions}>

              <Pressable
                onPress={() =>
                  void handleDownload()
                }
                disabled={downloading}
                style={[
                  styles.parentReportDownloadButton,
                  downloading &&
                    styles.buttonDisabled,
                ]}
              >
                {
                  downloading
                    ? (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />
                    )
                    : (
                      <Download
                        size={18}
                        color="#FFFFFF"
                      />
                    )
                }
              </Pressable>


              <Pressable
                onPress={close}
                disabled={downloading}
                style={styles.parentReportCloseButton}
              >
                <X
                  size={20}
                  color="#77788F"
                />
              </Pressable>

            </View>

          </View>


          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.parentReportScrollContent}
          >

            <View style={styles.parentReportHero}>

              <View style={styles.parentReportHeroCopy}>

                <Text style={styles.parentReportEyebrow}>
                  PARENT ASSESSMENT REPORT
                </Text>

                <Text style={styles.parentReportChildName}>
                  {
                    session.child_name ||
                    "Child"
                  }
                </Text>

                <Text style={styles.parentReportSessionId}>
                  Session #{session.id}
                </Text>

              </View>


              <View style={styles.parentReportScorePanel}>

                <Text style={styles.parentReportScoreLabel}>
                  Session Score
                </Text>

                <Text style={styles.parentReportScoreValue}>
                  {
                    sessionScore !== null
                      ? `${sessionScore}%`
                      : "—"
                  }
                </Text>

                <Text style={styles.parentReportScoreCaption}>
                  Recorded result
                </Text>

              </View>

            </View>


            <View style={styles.parentReportIdentityCard}>

              <View style={styles.parentReportIdentityIcon}>
                <UserRound
                  size={22}
                  color="#7465E8"
                />
              </View>


              <View style={styles.parentReportIdentityCopy}>

                <Text style={styles.parentReportFactLabel}>
                  Child
                </Text>

                <Text style={styles.parentReportIdentityName}>
                  {
                    session.child_name ||
                    "—"
                  }
                </Text>

              </View>

            </View>


            <View style={styles.parentReportFactsCard}>

              <View style={styles.parentReportFactRow}>
                <Text style={styles.parentReportFactLabel}>
                  Date
                </Text>

                <Text style={styles.parentReportFactValue}>
                  {
                    formatDate(
                      reportDate
                    )
                  }
                </Text>
              </View>


              <View style={styles.parentReportFactRow}>
                <Text style={styles.parentReportFactLabel}>
                  Status
                </Text>

                <View style={styles.parentReportFactValueWrap}>
                  <StatusPill
                    status={
                      session.status
                    }
                  />
                </View>
              </View>


              <View style={styles.parentReportFactRow}>
                <Text style={styles.parentReportFactLabel}>
                  Session
                </Text>

                <Text style={styles.parentReportFactValue}>
                  #{session.id}
                </Text>
              </View>

            </View>


            <View style={styles.parentReportSectionHeader}>

              <View style={styles.flexOne}>
                <Text style={styles.parentReportSectionEyebrow}>
                  SESSION BREAKDOWN
                </Text>

                <Text style={styles.parentReportSectionTitle}>
                  Game Results
                </Text>

                <Text style={styles.parentReportSectionSubtitle}>
                  Recorded results for each assessment game.
                </Text>
              </View>


              <View style={styles.parentReportGameCount}>
                <Text style={styles.parentReportGameCountText}>
                  {
                    Array.isArray(
                      session.games
                    )
                      ? session.games.length
                      : 0
                  }{" "}
                  Games
                </Text>
              </View>

            </View>


            {
              Array.isArray(
                session.games
              ) &&
              session.games.length
                ? (
                  <View style={styles.parentReportGamesList}>

                    {
                      session.games.map(
                        (
                          game,
                          index
                        ) => {

                          const score =
                            getGameScore(
                              game
                            );


                          return (

                            <View
                              key={
                                game.id ??
                                index
                              }
                              style={styles.parentReportGameCard}
                            >

                              <View style={styles.parentReportGameHeader}>

                                <View style={styles.parentReportGameIdentity}>

                                  <View style={styles.parentReportGameNumber}>
                                    <Text style={styles.parentReportGameNumberText}>
                                      {
                                        String(
                                          index + 1
                                        ).padStart(
                                          2,
                                          "0"
                                        )
                                      }
                                    </Text>
                                  </View>


                                  <View style={styles.parentReportGameCopy}>

                                    <Text style={styles.parentReportGameName}>
                                      {
                                        game.game_name ||
                                        "Assessment Game"
                                      }
                                    </Text>

                                    <Text style={styles.parentReportGameDomain}>
                                      {
                                        getDomainName(
                                          game
                                        ) ||
                                        "Assessment Game"
                                      }
                                    </Text>

                                  </View>

                                </View>


                                <StatusPill
                                  status={
                                    game.status
                                  }
                                />

                              </View>


                              <View style={styles.parentReportMetrics}>

                                <View style={styles.parentReportMetricRow}>
                                  <Text style={styles.parentReportMetricLabel}>
                                    Score
                                  </Text>

                                  <Text style={styles.parentReportMetricValue}>
                                    {
                                      score !== null
                                        ? `${score}%`
                                        : "—"
                                    }
                                  </Text>
                                </View>


                                <View style={styles.parentReportMetricRow}>
                                  <Text style={styles.parentReportMetricLabel}>
                                    Accuracy
                                  </Text>

                                  <Text style={styles.parentReportMetricValue}>
                                    {
                                      game.accuracy !== null &&
                                      game.accuracy !== undefined &&
                                      game.accuracy !== ""
                                        ? `${Math.round(
                                            Number(
                                              game.accuracy
                                            )
                                          )}%`
                                        : "—"
                                    }
                                  </Text>
                                </View>


                                <View
                                  style={[
                                    styles.parentReportMetricRow,
                                    styles.parentReportMetricRowLast,
                                  ]}
                                >
                                  <Text style={styles.parentReportMetricLabel}>
                                    Status
                                  </Text>

                                  <Text style={styles.parentReportMetricValue}>
                                    {
                                      game.status ||
                                      "—"
                                    }
                                  </Text>
                                </View>

                              </View>

                            </View>

                          );

                        }
                      )
                    }

                  </View>
                )
                : (
                  <View style={styles.parentReportEmpty}>
                    <Text style={styles.parentReportEmptyText}>
                      No game results are available for this session.
                    </Text>
                  </View>
                )
            }


            <View style={styles.parentReportFooter}>
              <Text style={styles.parentReportFooterText}>
                KidMind Assessment Report
              </Text>

              <Text style={styles.parentReportFooterText}>
                Session #{session.id}
              </Text>
            </View>

          </ScrollView>

        </View>

      </View>
    </Modal>
  );
}

function EditChildModal({
  child,
  close,
  onSuccess,
}: {
  child: ParentChild;
  close: () => void;
  onSuccess: () => Promise<void>;
}) {
  const [fullName, setFullName] = useState(child.full_name || "");
  const [age, setAge] = useState(String(child.age ?? ""));
  const [gender, setGender] = useState(child.gender || "Female");
  const [region, setRegion] = useState(child.region || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const numericAge = Number(age);

    if (!fullName.trim()) {
      Alert.alert("Missing Information", "Please enter the child name.");
      return;
    }

    if (!Number.isInteger(numericAge) || numericAge <= 0) {
      Alert.alert("Invalid Age", "Please enter a valid age.");
      return;
    }

    if (!region.trim()) {
      Alert.alert("Missing Information", "Please enter the region.");
      return;
    }

    try {
      setSaving(true);

      await authRequest<{ message: string }>(
        `/children/parent/${child.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: fullName.trim(),
            age: numericAge,
            gender,
            region: region.trim(),
          }),
        }
      );

      await onSuccess();
    } catch (saveError) {
      Alert.alert(
        "Update Failed",
        saveError instanceof Error
          ? saveError.message
          : "Failed to update child."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.editModal}>
          <View style={styles.modalHeader}>
            <View style={styles.editTitleRow}>
              <View style={styles.editIconBox}>
                <Pencil size={22} color="#4F7FD8" />
              </View>

              <View>
                <Text style={styles.modalTitle}>Edit Child</Text>
                <Text style={styles.modalLabel}>
                  Update basic child information
                </Text>
              </View>
            </View>

            <Pressable
              onPress={close}
              disabled={saving}
              style={styles.modalClose}
            >
              <X size={20} color="#77788F" />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <EditField
              label="Child Name"
              value={fullName}
              onChangeText={setFullName}
              editable={!saving}
            />

            <EditField
              label="Age"
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              editable={!saving}
            />

            <Text style={styles.editLabel}>Gender</Text>

            <View style={styles.genderRow}>
              {["Female", "Male"].map((option) => {
                const active = gender === option;

                return (
                  <Pressable
                    key={option}
                    disabled={saving}
                    onPress={() => setGender(option)}
                    style={[
                      styles.genderButton,
                      active && styles.genderButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        active && styles.genderButtonTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <EditField
              label="Region"
              value={region}
              onChangeText={setRegion}
              editable={!saving}
            />

            <View style={styles.modalActions}>
              <Pressable
                onPress={close}
                disabled={saving}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={save}
                disabled={saving}
                style={[
                  styles.saveButton,
                  saving && styles.buttonDisabled,
                ]}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    Save Changes
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function EditField({
  label,
  value,
  onChangeText,
  keyboardType,
  editable,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: KeyboardTypeOptions;
  editable: boolean;
}) {
  return (
    <View style={styles.editField}>
      <Text style={styles.editLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        editable={editable}
        style={styles.editInput}
        placeholderTextColor="#A3ABC0"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  scroll: {
    flex: 1,
  },
  chatContent: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 45,
    gap: 16,
  },
  flexOne: {
    flex: 1,
  },

  loadingPage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    backgroundColor: "#F7F8FC",
  },
  loadingText: {
    color: "#56587A",
    fontSize: 14,
    fontWeight: "600",
  },

  /* Header — same visual system as Admin mobile */
  topbar: {
    height: 74,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEFF5",
    backgroundColor: "#FFFFFF",
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#ECECF4",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  headerText: {
    flex: 1,
    paddingHorizontal: 13,
  },
  topUser: {
    flex: 1,
  },
  topUserText: {
    flex: 1,
  },
  topUserRole: {
    color: "#A0A3B5",
    fontSize: 10.5,
  },
  topUserName: {
    marginTop: 2,
    color: "#343654",
    fontSize: 14,
    fontWeight: "700",
  },
  avatarButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#ECECF4",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  topAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0EDFF",
  },
  topAvatarText: {
    color: "#7465E8",
    fontSize: 12,
    fontWeight: "800",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 2,
  },
  sectionTitle: {
    color: "#34365A",
    fontSize: 25,
    fontWeight: "800",
  },
  sectionSubtitle: {
    marginTop: 6,
    color: "#989BAD",
    fontSize: 12.5,
    lineHeight: 18,
  },
  refreshButton: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderColor: "#ECECF4",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  errorBox: {
    padding: 13,
    borderRadius: 14,
    backgroundColor: "#FFF0F3",
    borderWidth: 1,
    borderColor: "#F6D8DF",
  },
  errorText: {
    color: "#B9415E",
    fontSize: 13,
  },

  selectorSection: {
    marginBottom: 2,
  },
  selectorLabel: {
    marginBottom: 8,
    color: "#9293A8",
    fontSize: 11,
    fontWeight: "700",
  },
  selectorScroll: {
    gap: 8,
    paddingRight: 10,
  },
  selectorChip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ECECF5",
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
  },
  selectorChipActive: {
    borderColor: "#DED8FF",
    backgroundColor: "#F0EDFF",
  },
  selectorChipText: {
    color: "#62637E",
    fontSize: 11,
    fontWeight: "700",
  },
  selectorChipTextActive: {
    color: "#7465E8",
  },

  childHero: {
    padding: 20,
    borderWidth: 1,
    borderColor: "#ECECF4",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  largeAvatar: {
    width: 66,
    height: 66,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0EDFF",
  },
  largeAvatarText: {
    color: "#7465E8",
    fontSize: 20,
    fontWeight: "800",
  },
  childHeroInfo: {
    marginTop: 14,
  },
  eyebrow: {
    color: "#988CCF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  childHeroName: {
    marginTop: 5,
    color: "#333554",
    fontSize: 22,
    fontWeight: "800",
  },
  metaWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 10,
  },
  metaChip: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F5F3FB",
  },
  metaChipText: {
    color: "#7C7D97",
    fontSize: 10,
    fontWeight: "600",
  },
  therapistSummary: {
    marginTop: 16,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#ECEAF5",
  },
  therapistSummaryName: {
    marginTop: 5,
    color: "#333554",
    fontSize: 13,
    fontWeight: "800",
  },

  statsGrid: {
    gap: 12,
  },
  statCard: {
    minHeight: 126,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 19,
    borderWidth: 1,
    borderColor: "#ECECF4",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  statIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statTitle: {
    color: "#85899D",
    fontSize: 11.5,
  },
  statValue: {
    marginTop: 2,
    color: "#2E3054",
    fontSize: 25,
    fontWeight: "800",
  },
  statSubtitle: {
    marginTop: 2,
    color: "#A0A3B3",
    fontSize: 10.5,
  },

  panel: {
    padding: 19,
    borderWidth: 1,
    borderColor: "#ECECF4",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  },
  panelTitle: {
    color: "#333554",
    fontSize: 16,
    fontWeight: "800",
  },
  panelSubtitle: {
    marginTop: 4,
    color: "#A0A3B4",
    fontSize: 11.5,
    lineHeight: 16,
  },

  snapshotGrid: {
    gap: 11,
  },
  snapshotCard: {
    flexDirection: "row",
    gap: 12,
    padding: 15,
    borderRadius: 14,
  },
  positiveCard: {
    backgroundColor: "#ECFAF4",
  },
  attentionCard: {
    backgroundColor: "#FFF4F3",
  },
  snapshotIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
  },
  smallLabel: {
    color: "#9293A5",
    fontSize: 10,
  },
  snapshotTitle: {
    marginTop: 4,
    color: "#333554",
    fontSize: 13,
    fontWeight: "800",
  },
  snapshotSmall: {
    marginTop: 4,
    color: "#999AAC",
    fontSize: 10,
  },

  activityCard: {
    padding: 15,
    borderRadius: 14,
    backgroundColor: "#F8F7FD",
  },
  activityTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 14,
  },
  activityLabel: {
    color: "#8F90A6",
    fontSize: 11,
  },
  activityDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  iconTextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activityDetailText: {
    color: "#83849B",
    fontSize: 10,
  },

  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F0EDFF",
  },
  viewAllText: {
    color: "#7465E8",
    fontSize: 10,
    fontWeight: "800",
  },
  recentReportRow: {
    minHeight: 75,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F1F6",
  },
  recentReportTitle: {
    color: "#444564",
    fontSize: 11,
    fontWeight: "800",
  },
  recentReportDate: {
    marginTop: 4,
    color: "#999AAC",
    fontSize: 9,
  },
  recentScoreWrap: {
    alignItems: "flex-end",
    gap: 5,
  },
  recentScore: {
    color: "#5F607C",
    fontSize: 12,
    fontWeight: "800",
  },
  eyeButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#F0EDFF",
  },

  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },
  miniEmpty: {
    paddingVertical: 20,
    color: "#A0A1B2",
    fontSize: 11,
    textAlign: "center",
  },

  childCard: {
    marginBottom: 14,
    padding: 19,
    borderWidth: 1,
    borderColor: "#ECECF4",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  childCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F5",
  },
  childCardAvatar: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#F0EDFF",
  },
  childCardAvatarText: {
    color: "#7465E8",
    fontSize: 16,
    fontWeight: "800",
  },
  childCardName: {
    color: "#333554",
    fontSize: 17,
    fontWeight: "800",
  },
  childCardMeta: {
    marginTop: 5,
    color: "#999AAC",
    fontSize: 10,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 16,
    gap: 10,
  },
  infoItem: {
    width: "47%",
    minHeight: 45,
  },
  infoLabel: {
    color: "#A0A1B2",
    fontSize: 9,
  },
  infoValue: {
    marginTop: 4,
    color: "#444564",
    fontSize: 11,
    fontWeight: "800",
  },
  childActions: {
    flexDirection: "row",
    gap: 9,
  },
  primarySoftButton: {
    flex: 1,
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 11,
    backgroundColor: "#F0EDFF",
  },
  primarySoftText: {
    color: "#6D59C8",
    fontSize: 11,
    fontWeight: "800",
  },
  editButton: {
    width: 44,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "#EDF6FF",
  },

  sessionCard: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEF5",
  },
  sessionTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  sessionNumber: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "#F0EDFF",
  },
  sessionNumberText: {
    color: "#7465E8",
    fontSize: 11,
    fontWeight: "800",
  },
  sessionTitle: {
    color: "#444564",
    fontSize: 12,
    fontWeight: "800",
  },
  sessionDate: {
    marginTop: 4,
    color: "#9A9BAD",
    fontSize: 9,
  },
  sessionInfoGrid: {
    marginTop: 15,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  reportCard: {
    marginBottom: 14,
    padding: 19,
    borderWidth: 1,
    borderColor: "#ECECF4",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  reportTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F0EDFF",
  },
  reportTitle: {
    marginTop: 17,
    color: "#333554",
    fontSize: 16,
    fontWeight: "800",
  },
  reportDate: {
    marginTop: 4,
    marginBottom: 17,
    color: "#999AAC",
    fontSize: 10,
  },
  reportScore: {
    padding: 14,
    marginBottom: 13,
    borderRadius: 13,
    backgroundColor: "#F8F7FD",
  },
  reportScoreValue: {
    marginTop: 4,
    color: "#6655BD",
    fontSize: 23,
    fontWeight: "800",
  },
  reportMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  reportMetaText: {
    color: "#87889C",
    fontSize: 10,
  },

  progressRow: {
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F5",
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  progressTitle: {
    color: "#444564",
    fontSize: 12,
    fontWeight: "800",
  },
  progressPrevious: {
    marginTop: 4,
    color: "#9A9BAD",
    fontSize: 9,
  },
  progressValueWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressValue: {
    color: "#444564",
    fontSize: 12,
    fontWeight: "800",
  },
  changeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 7,
  },
  changePositive: {
    backgroundColor: "#EAF8F1",
  },
  changeNegative: {
    backgroundColor: "#FFF0F2",
  },
  changeNeutral: {
    backgroundColor: "#F1F1F5",
  },
  changeText: {
    fontSize: 9,
    fontWeight: "800",
  },
  changePositiveText: {
    color: "#3B9271",
  },
  changeNegativeText: {
    color: "#C35E6D",
  },
  changeNeutralText: {
    color: "#77788C",
  },
  progressTrack: {
    width: "100%",
    height: 9,
    overflow: "hidden",
    borderRadius: 20,
    backgroundColor: "#F0EFF6",
  },
  progressFill: {
    height: "100%",
    borderRadius: 20,
    backgroundColor: "#8B79DF",
  },

  therapistCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEF5",
  },
  therapistAvatar: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "#F0EDFF",
  },
  therapistAvatarText: {
    color: "#7465E8",
    fontSize: 12,
    fontWeight: "800",
  },
  therapistName: {
    color: "#444564",
    fontSize: 12,
    fontWeight: "800",
  },
  therapistRole: {
    marginTop: 3,
    color: "#9B9CAD",
    fontSize: 9,
  },
  comingSoonButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F3F2F7",
  },
  comingSoonText: {
    color: "#A0A0AE",
    fontSize: 8,
    fontWeight: "700",
  },

  settingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
  },
  settingsAvatar: {
    width: 75,
    height: 75,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: "#F0EDFF",
  },
  settingsAvatarText: {
    color: "#7465E8",
    fontSize: 21,
    fontWeight: "800",
  },
  settingsName: {
    color: "#333554",
    fontSize: 17,
    fontWeight: "800",
  },
  settingsRole: {
    marginTop: 4,
    color: "#999AAD",
    fontSize: 10,
  },
  settingsGrid: {
    gap: 10,
  },
  infoBlock: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FAFAFD",
  },
  infoBlockLabel: {
    color: "#9B9BAD",
    fontSize: 9,
  },
  infoBlockValue: {
    marginTop: 5,
    color: "#444564",
    fontSize: 12,
    fontWeight: "800",
  },

  emptyState: {
    minHeight: 280,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ECECF4",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  emptyInsidePanel: {
    minHeight: 210,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginTop: 13,
    color: "#4D4E6C",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyMessage: {
    marginTop: 6,
    maxWidth: 350,
    color: "#A2A2B3",
    fontSize: 10,
    lineHeight: 17,
    textAlign: "center",
  },

  /* Drawer — same dimensions, logo and navigation theme as Admin */
  drawerBackdrop: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(35,37,64,.32)",
  },
  drawerDismiss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawer: {
    width: 285,
    height: "100%",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#ECECF5",
  },
  drawerTop: {
    height: 112,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  drawerLogo: {
    width: 190,
    height: 105,
  },
  drawerClose: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F7F7FB",
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EBE5FF",
    borderRadius: 16,
    backgroundColor: "#F5F0FF",
  },
  roleIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  roleTitle: {
    color: "#37306F",
    fontSize: 13,
    fontWeight: "800",
  },
  roleSubtitle: {
    marginTop: 2,
    color: "#989AB0",
    fontSize: 10.5,
  },
  drawerMenuItem: {
    height: 45,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    marginBottom: 4,
    borderRadius: 14,
  },
  drawerMenuItemActive: {
    backgroundColor: "#F0EDFF",
  },
  drawerMenuText: {
    color: "#8A8EA5",
    fontSize: 13.5,
  },
  drawerMenuTextActive: {
    color: "#7465E8",
    fontWeight: "700",
  },
  logoutButton: {
    height: 46,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#FFF8F9",
  },
  logoutText: {
    color: "#E35469",
    fontSize: 13.5,
    fontWeight: "700",
  },

  modalBackdrop: {
    flex: 1,
    paddingHorizontal: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(30,28,51,0.46)",
  },
  reportModal: {
    width: "100%",
    maxHeight: "88%",
    padding: 20,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  editModal: {
    width: "100%",
    maxHeight: "88%",
    padding: 20,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEF5",
  },
  modalLabel: {
    color: "#999AAD",
    fontSize: 9,
  },
  modalTitle: {
    marginTop: 4,
    color: "#333459",
    fontSize: 19,
    fontWeight: "800",
  },
  modalClose: {
    width: 37,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "#F4F3F8",
  },
  modalSummaryGrid: {
    gap: 9,
    paddingVertical: 5,
  },
  gamesTitle: {
    marginTop: 17,
    marginBottom: 12,
    color: "#333459",
    fontSize: 14,
    fontWeight: "800",
  },
  gameCard: {
    marginBottom: 10,
    padding: 13,
    borderWidth: 1,
    borderColor: "#EEEEF5",
    borderRadius: 13,
  },
  gameHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  gameName: {
    color: "#444564",
    fontSize: 11,
    fontWeight: "800",
  },
  gameDomain: {
    marginTop: 3,
    color: "#999AAD",
    fontSize: 9,
  },
  gameDetails: {
    marginTop: 12,
    flexDirection: "row",
    gap: 15,
  },
  editTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  editIconBox: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "#EDF6FF",
  },
  editField: {
    marginBottom: 17,
  },
  editLabel: {
    marginBottom: 8,
    color: "#596078",
    fontSize: 11,
    fontWeight: "700",
  },
  editInput: {
    height: 51,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E0E2EE",
    borderRadius: 13,
    color: "#333459",
    fontSize: 13,
    backgroundColor: "#FFFFFF",
  },
  genderRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 17,
  },
  genderButton: {
    flex: 1,
    height: 49,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E2EE",
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
  },
  genderButtonActive: {
    borderColor: "#DED8FF",
    backgroundColor: "#F0EDFF",
  },
  genderButtonText: {
    color: "#6A6C82",
    fontSize: 12,
    fontWeight: "700",
  },
  genderButtonTextActive: {
    color: "#7465E8",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 5,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E2EE",
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
  },
  cancelButtonText: {
    color: "#62657A",
    fontSize: 12,
    fontWeight: "800",
  },
  saveButton: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "#7968ED",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  parentReportModal: {
    width: "100%",
    maxHeight: "92%",
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7E7EF",
  },

  parentReportToolbar: {
    minHeight: 67,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECF4",
    backgroundColor: "#FFFFFF",
  },

  parentReportToolbarCopy: {
    flex: 1,
    minWidth: 0,
  },

  parentReportToolbarLabel: {
    color: "#8B7CE3",
    fontSize: 8.5,
    fontWeight: "800",
    letterSpacing: 0.9,
  },

  parentReportToolbarTitle: {
    marginTop: 3,
    color: "#333554",
    fontSize: 15,
    fontWeight: "800",
  },

  parentReportToolbarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  parentReportDownloadButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#7465E8",
  },

  parentReportCloseButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F5F4F8",
  },

  parentReportScrollContent: {
    paddingBottom: 18,
  },

  parentReportHero: {
    padding: 19,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 13,
    backgroundColor: "#FCFCFF",
  },

  parentReportHeroCopy: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },

  parentReportEyebrow: {
    color: "#8B7CE3",
    fontSize: 8.5,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  parentReportChildName: {
    marginTop: 7,
    color: "#2E3054",
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "800",
  },

  parentReportSessionId: {
    marginTop: 5,
    color: "#999CAD",
    fontSize: 9.5,
    fontWeight: "600",
  },

  parentReportScorePanel: {
    width: 118,
    flexShrink: 0,
    paddingHorizontal: 14,
    paddingVertical: 15,
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#7968ED",
  },

  parentReportScoreLabel: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 8.5,
    fontWeight: "700",
  },

  parentReportScoreValue: {
    marginTop: 4,
    color: "#FFFFFF",
    fontSize: 29,
    lineHeight: 33,
    fontWeight: "800",
  },

  parentReportScoreCaption: {
    marginTop: 5,
    color: "rgba(255,255,255,0.66)",
    fontSize: 7.5,
  },

  parentReportIdentityCard: {
    marginHorizontal: 18,
    marginTop: 15,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderWidth: 1,
    borderColor: "#E9E7F2",
    borderRadius: 16,
    backgroundColor: "#F8F6FF",
  },

  parentReportIdentityIcon: {
    width: 41,
    height: 41,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E3DFFF",
    backgroundColor: "#FFFFFF",
  },

  parentReportIdentityCopy: {
    flex: 1,
  },

  parentReportIdentityName: {
    marginTop: 4,
    color: "#3C3E5B",
    fontSize: 13,
    fontWeight: "800",
  },

  parentReportFactsCard: {
    marginHorizontal: 18,
    marginTop: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E9E8F0",
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
  },

  parentReportFactRow: {
    minHeight: 49,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFF4",
  },

  parentReportFactLabel: {
    color: "#999CAD",
    fontSize: 9,
    fontWeight: "600",
  },

  parentReportFactValueWrap: {
    flex: 1,
    alignItems: "flex-end",
  },

  parentReportFactValue: {
    flex: 1,
    color: "#454760",
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: "700",
    textAlign: "right",
  },

  parentReportSectionHeader: {
    marginHorizontal: 18,
    marginTop: 22,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },

  parentReportSectionEyebrow: {
    color: "#8B7CE3",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  parentReportSectionTitle: {
    marginTop: 5,
    color: "#343653",
    fontSize: 17,
    fontWeight: "800",
  },

  parentReportSectionSubtitle: {
    marginTop: 4,
    color: "#999CAD",
    fontSize: 9,
    lineHeight: 14,
  },

  parentReportGameCount: {
    minHeight: 30,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#F0EDFF",
  },

  parentReportGameCountText: {
    color: "#7465E8",
    fontSize: 8.5,
    fontWeight: "800",
  },

  parentReportGamesList: {
    marginHorizontal: 18,
    marginTop: 13,
    gap: 10,
  },

  parentReportGameCard: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8E8F0",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },

  parentReportGameHeader: {
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFF4",
    backgroundColor: "#FCFCFE",
  },

  parentReportGameIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  parentReportGameNumber: {
    width: 34,
    height: 34,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#F0EDFF",
  },

  parentReportGameNumberText: {
    color: "#7465E8",
    fontSize: 9,
    fontWeight: "800",
  },

  parentReportGameCopy: {
    flex: 1,
    minWidth: 0,
  },

  parentReportGameName: {
    color: "#3F415C",
    fontSize: 11,
    fontWeight: "800",
  },

  parentReportGameDomain: {
    marginTop: 3,
    color: "#999CAD",
    fontSize: 8.5,
  },

  parentReportMetrics: {
    paddingHorizontal: 13,
  },

  parentReportMetricRow: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F4",
  },

  parentReportMetricRowLast: {
    borderBottomWidth: 0,
  },

  parentReportMetricLabel: {
    color: "#999CAD",
    fontSize: 9,
  },

  parentReportMetricValue: {
    color: "#44465F",
    fontSize: 10,
    fontWeight: "800",
  },

  parentReportEmpty: {
    marginHorizontal: 18,
    marginTop: 13,
    padding: 25,
    alignItems: "center",
    borderRadius: 15,
    backgroundColor: "#F8F8FB",
  },

  parentReportEmptyText: {
    color: "#999CAD",
    fontSize: 10,
    textAlign: "center",
  },

  parentReportFooter: {
    minHeight: 49,
    marginTop: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEEEF4",
    backgroundColor: "#FAFAFC",
  },

  parentReportFooterText: {
    color: "#A0A3B4",
    fontSize: 8,
    fontWeight: "600",
  },
});
