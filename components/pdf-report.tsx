import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer"
import type { ReportData } from "@/lib/pdf-report-data"

// ─── Font registration (Space Grotesk — matches app) ────────────────────────

Font.register({
  family: "SpaceGrotesk",
  fonts: [
    { src: "https://fonts.gstatic.com/s/spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj62UUsj.ttf", fontWeight: 300 },
    { src: "https://fonts.gstatic.com/s/spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7oUUsj.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7aUUsj.ttf", fontWeight: 500 },
    { src: "https://fonts.gstatic.com/s/spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj42Vksj.ttf", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj4PVksj.ttf", fontWeight: 700 },
  ],
})

// ─── Theme colors ────────────────────────────────────────────────────────────

const C = {
  bg: "#0F0F0F",
  card: "#1C1C1C",
  cardAlt: "#151515",
  lime: "#AAFF00",
  limeDim: "#6B9F00",
  white: "#FFFFFF",
  muted: "#8C8C8C",
  border: "#2E2E2E",
  green: "#4ade80",
  red: "#f87171",
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    color: C.white,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    fontFamily: "SpaceGrotesk",
    fontSize: 9,
  },
  // Header
  header: { marginBottom: 28 },
  title: { fontSize: 26, fontFamily: "SpaceGrotesk", fontWeight: 700, color: C.lime, marginBottom: 4 },
  subtitle: { fontSize: 10, color: C.muted },
  // Section
  sectionTitle: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk", fontWeight: 700,
    color: C.lime,
    marginBottom: 10,
    marginTop: 24,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  // Stats grid
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  statBox: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 8,
    padding: 12,
    alignItems: "center" as const,
  },
  statValue: { fontSize: 18, fontFamily: "SpaceGrotesk", fontWeight: 700, color: C.lime, marginBottom: 2 },
  statLabel: { fontSize: 7, color: C.muted, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  // Table
  tableHeader: {
    flexDirection: "row" as const,
    backgroundColor: C.lime,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 2,
  },
  tableHeaderText: { fontFamily: "SpaceGrotesk", fontWeight: 700, fontSize: 8, color: C.bg },
  tableRow: {
    flexDirection: "row" as const,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
  tableCell: { fontSize: 8, color: C.white },
  tableCellMuted: { fontSize: 8, color: C.muted },
  // Progress bar
  progressBarOuter: {
    height: 8,
    backgroundColor: C.border,
    borderRadius: 4,
    overflow: "hidden" as const,
    flex: 1,
  },
  progressBarInner: {
    height: 8,
    backgroundColor: C.lime,
    borderRadius: 4,
  },
  // Goal row
  goalRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: C.card,
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
  },
  // Footer
  footer: {
    position: "absolute" as const,
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  footerText: { fontSize: 7, color: C.muted },
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}
function fmtVol(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toLocaleString()
}
function fmtDur(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

// ─── Document ────────────────────────────────────────────────────────────────

export function FitTrackerReport({ data }: { data: ReportData }) {
  const { summary, workoutHistory, muscleBreakdown, personalRecords, goals } = data
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>FitTracker Report</Text>
          <Text style={s.subtitle}>
            Generated on {fmtDate(data.generatedAt)} &bull; All-time fitness summary
          </Text>
        </View>

        {/* Summary Stats */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statValue}>{summary.totalWorkouts}</Text>
            <Text style={s.statLabel}>Workouts</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statValue}>{summary.currentStreak}</Text>
            <Text style={s.statLabel}>Day Streak</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statValue}>{fmtVol(summary.totalVolume)}</Text>
            <Text style={s.statLabel}>Total Volume</Text>
          </View>
        </View>
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statValue}>{fmtDur(summary.totalDuration)}</Text>
            <Text style={s.statLabel}>Time Trained</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statValue}>{summary.avgWorkoutsPerWeek}</Text>
            <Text style={s.statLabel}>Avg / Week</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statValue}>{summary.mostTrainedMuscle}</Text>
            <Text style={s.statLabel}>Top Muscle</Text>
          </View>
        </View>

        {/* Workout History */}
        {workoutHistory.length > 0 && (
          <View wrap={false}>
            <Text style={s.sectionTitle}>Recent Workouts</Text>
            <View style={s.tableHeader}>
              <Text style={[s.tableHeaderText, { flex: 1.2 }]}>Date</Text>
              <Text style={[s.tableHeaderText, { flex: 2 }]}>Workout</Text>
              <Text style={[s.tableHeaderText, { flex: 0.8, textAlign: "center" }]}>Exercises</Text>
              <Text style={[s.tableHeaderText, { flex: 1, textAlign: "right" }]}>Volume</Text>
              <Text style={[s.tableHeaderText, { flex: 0.8, textAlign: "right" }]}>Duration</Text>
            </View>
            {workoutHistory.slice(0, 15).map((w, i) => (
              <View
                key={i}
                style={[s.tableRow, { backgroundColor: i % 2 === 0 ? C.card : C.cardAlt }]}
              >
                <Text style={[s.tableCellMuted, { flex: 1.2 }]}>{fmtDate(w.date)}</Text>
                <Text style={[s.tableCell, { flex: 2 }]}>{w.name}</Text>
                <Text style={[s.tableCell, { flex: 0.8, textAlign: "center" }]}>{w.exerciseCount}</Text>
                <Text style={[s.tableCell, { flex: 1, textAlign: "right" }]}>{fmtVol(w.totalVolume)}</Text>
                <Text style={[s.tableCellMuted, { flex: 0.8, textAlign: "right" }]}>{fmtDur(w.duration)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Muscle Breakdown */}
        {muscleBreakdown.length > 0 && (
          <View wrap={false}>
            <Text style={s.sectionTitle}>Muscle Group Breakdown</Text>
            <View style={s.tableHeader}>
              <Text style={[s.tableHeaderText, { flex: 2 }]}>Muscle Group</Text>
              <Text style={[s.tableHeaderText, { flex: 1, textAlign: "right" }]}>Total Volume</Text>
            </View>
            {muscleBreakdown.map((m, i) => (
              <View
                key={i}
                style={[s.tableRow, { backgroundColor: i % 2 === 0 ? C.card : C.cardAlt }]}
              >
                <Text style={[s.tableCell, { flex: 2 }]}>{m.muscle}</Text>
                <Text style={[s.tableCell, { flex: 1, textAlign: "right" }]}>{fmtVol(m.volume)}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>

      {/* Page 2: PRs + Goals */}
      <Page size="A4" style={s.page}>
        {/* Personal Records */}
        {personalRecords.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Personal Records</Text>
            <View style={s.tableHeader}>
              <Text style={[s.tableHeaderText, { flex: 2.5 }]}>Exercise</Text>
              <Text style={[s.tableHeaderText, { flex: 1, textAlign: "right" }]}>Weight</Text>
              <Text style={[s.tableHeaderText, { flex: 0.7, textAlign: "right" }]}>Reps</Text>
              <Text style={[s.tableHeaderText, { flex: 1.2, textAlign: "right" }]}>Date</Text>
            </View>
            {personalRecords.slice(0, 20).map((pr, i) => (
              <View
                key={i}
                style={[s.tableRow, { backgroundColor: i % 2 === 0 ? C.card : C.cardAlt }]}
              >
                <Text style={[s.tableCell, { flex: 2.5 }]}>{pr.exercise}</Text>
                <Text style={[s.tableCell, { flex: 1, textAlign: "right" }]}>{pr.weight} kg</Text>
                <Text style={[s.tableCell, { flex: 0.7, textAlign: "right" }]}>{pr.reps}</Text>
                <Text style={[s.tableCellMuted, { flex: 1.2, textAlign: "right" }]}>{fmtDate(pr.date)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Goals */}
        {goals.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Goals</Text>
            {goals.map((g, i) => {
              const pct = g.target > 0 ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0
              return (
                <View key={i} style={s.goalRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={{ fontSize: 9, fontFamily: "SpaceGrotesk", fontWeight: 700, color: C.white, marginBottom: 2 }}>
                      {g.title}
                    </Text>
                    <Text style={{ fontSize: 7, color: C.muted }}>
                      {g.current} / {g.target} {g.unit}
                    </Text>
                  </View>
                  <View style={{ flex: 2, flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={s.progressBarOuter}>
                      <View
                        style={[
                          s.progressBarInner,
                          {
                            width: `${pct}%`,
                            backgroundColor: g.completed ? C.green : C.lime,
                          },
                        ]}
                      />
                    </View>
                    <Text style={{ fontSize: 8, fontFamily: "SpaceGrotesk", fontWeight: 700, color: g.completed ? C.green : C.lime, width: 32, textAlign: "right" }}>
                      {pct}%
                    </Text>
                  </View>
                </View>
              )
            })}
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>FitTracker</Text>
          <Text style={s.footerText}>Generated {fmtDate(data.generatedAt)}</Text>
        </View>
      </Page>
    </Document>
  )
}
