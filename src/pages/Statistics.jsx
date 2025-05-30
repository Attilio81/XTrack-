
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { 
  Box, 
  Typography, 
  Grid, 
  CircularProgress,
  Card,
  CardContent,
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material'
import { 
  BarChart as BarChart3Icon, 
  TrendingUp as TrendingUpIcon, 
  CalendarToday as CalendarIcon, 
  EmojiEvents as TrophyIcon,
  TrackChanges as TargetIcon, 
  AccessTime as ClockIcon, 
  FitnessCenter as DumbbellIcon, 
  DirectionsRun as ActivityIcon
} from '@mui/icons-material'
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts'
import { colors, commonStyles } from '../theme'
import MetricCard from '../components/MetricCard'
import ProgressRing from '../components/ProgressRing'

const Statistics = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalPRs: 0,
    avgWorkoutsPerWeek: 0,
    strengthProgress: [],
    benchmarkProgress: [],
    categoryDistribution: [],
    monthlyActivity: [],
    recentPRs: []
  })
  const [timeRange, setTimeRange] = useState('6m') // 1m, 3m, 6m, 1y, all
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [timeRange])

  const loadStatistics = async () => {
    try {
      const dateFrom = getDateFrom(timeRange)
      
      // Get benchmark results
      const { data: benchmarkResults } = await supabase
        .from('benchmark_results')
        .select(`
          *,
          benchmarks (name, category, type)
        `)
        .eq('user_id', user.id)
        .gte('date', dateFrom)
        .order('date', { ascending: true })

      // Get strength records
      const { data: strengthRecords } = await supabase
        .from('strength_records')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', dateFrom)
        .order('date', { ascending: true })

      // Get body metrics for weight correlation
      const { data: bodyMetrics } = await supabase
        .from('body_metrics')
        .select('weight, date')
        .eq('user_id', user.id)
        .gte('date', dateFrom)
        .order('date', { ascending: true })

      const processedStats = processStatistics(benchmarkResults, strengthRecords, bodyMetrics)
      setStats(processedStats)
    } catch (error) {
      console.error('Error loading statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDateFrom = (range) => {
    const now = new Date()
    switch (range) {
      case '1m':
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0]
      case '3m':
        return new Date(now.setMonth(now.getMonth() - 3)).toISOString().split('T')[0]
      case '6m':
        return new Date(now.setMonth(now.getMonth() - 6)).toISOString().split('T')[0]
      case '1y':
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split('T')[0]
      case 'all':
      default:
        return '2020-01-01'
    }
  }

  const processStatistics = (benchmarkResults, strengthRecords, bodyMetrics) => {
    // Total workouts and PRs
    const totalWorkouts = benchmarkResults.length + strengthRecords.length
    const totalPRs = benchmarkResults.filter(r => r.is_pr).length + strengthRecords.filter(r => r.is_pr).length

    // Weekly average
    const firstDate = [...benchmarkResults, ...strengthRecords].sort((a, b) => new Date(a.date) - new Date(b.date))[0]?.date
    const weeksSince = firstDate ? Math.ceil((new Date() - new Date(firstDate)) / (7 * 24 * 60 * 60 * 1000)) : 1
    const avgWorkoutsPerWeek = Math.round((totalWorkouts / weeksSince) * 10) / 10

    // Strength progress (main lifts over time)
    const mainLifts = ['Back Squat', 'Deadlift', 'Bench Press', 'Overhead Press']
    const strengthProgress = mainLifts.map(exercise => {
      const records = strengthRecords
        .filter(r => r.exercise === exercise)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
      
      return {
        exercise: exercise.split(' ')[0], // Shorten name
        data: records.map((record, index) => ({
          session: index + 1,
          weight: record.estimated_1rm,
          date: record.date
        }))
      }
    }).filter(lift => lift.data.length > 0)

    // Benchmark progress (famous WODs over time)
    const famousBenchmarks = ['Fran', 'Helen', 'Grace', 'Murph', 'DT']
    const benchmarkProgress = famousBenchmarks.map(name => {
      const results = benchmarkResults
        .filter(r => r.benchmarks.name === name && r.result_seconds)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
      
      return {
        benchmark: name,
        data: results.map((result, index) => ({
          attempt: index + 1,
          time: Math.round(result.result_seconds / 60 * 100) / 100, // Convert to minutes
          date: result.date
        }))
      }
    }).filter(benchmark => benchmark.data.length > 0)

    // Category distribution
    const categoryCount = {}
    benchmarkResults.forEach(result => {
      const category = result.benchmarks.category
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })
    
    const categoryDistribution = Object.entries(categoryCount).map(([category, count]) => ({
      name: category,
      value: count,
      percentage: Math.round((count / benchmarkResults.length) * 100)
    }))

    // Monthly activity
    const monthlyActivity = getMonthlyActivity(benchmarkResults, strengthRecords)

    // Recent PRs
    const allPRs = [
      ...benchmarkResults.filter(r => r.is_pr).map(r => ({
        ...r,
        type: 'benchmark',
        name: r.benchmarks.name,
        value: r.result
      })),
      ...strengthRecords.filter(r => r.is_pr).map(r => ({
        ...r,
        type: 'strength',
        name: r.exercise,
        value: `${r.weight}kg`
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)

    return {
      totalWorkouts,
      totalPRs,
      avgWorkoutsPerWeek,
      strengthProgress,
      benchmarkProgress,
      categoryDistribution,
      monthlyActivity,
      recentPRs: allPRs
    }
  }

  const getMonthlyActivity = (benchmarkResults, strengthRecords) => {
    const monthCounts = {}
    const allResults = [...benchmarkResults, ...strengthRecords]
    
    allResults.forEach(result => {
      const month = new Date(result.date).toISOString().slice(0, 7) // YYYY-MM
      monthCounts[month] = (monthCounts[month] || 0) + 1
    })

    return Object.entries(monthCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('it-IT', { 
          month: 'short', 
          year: '2-digit' 
        }),
        workouts: count
      }))
  }

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="300px">
        <CircularProgress sx={{ color: colors.primary.main }} />
      </Box>
    )
  }

  return (
    <Box sx={{ py: 3 }}>
      {/* Header */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" gap={2} mb={4}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="700" color="text.primary" gutterBottom>
            Statistics
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Analisi dettagliata dei tuoi progressi
          </Typography>
        </Box>
        
        {/* Time Range Selector */}
        <Card sx={{ ...commonStyles.glassCard }}>
          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
            <ButtonGroup variant="outlined" size="small">
              {[
                { key: '1m', label: '1M' },
                { key: '3m', label: '3M' },
                { key: '6m', label: '6M' },
                { key: '1y', label: '1A' },
                { key: 'all', label: 'Tutto' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  onClick={() => setTimeRange(key)}
                  variant={timeRange === key ? 'contained' : 'outlined'}
                  sx={{
                    backgroundColor: timeRange === key ? colors.primary.main : 'transparent',
                    color: timeRange === key ? 'black' : colors.text.secondary,
                    borderColor: colors.primary.main,
                    '&:hover': {
                      backgroundColor: timeRange === key ? colors.primary.dark : `${colors.primary.main}20`,
                      borderColor: colors.primary.main
                    }
                  }}
                >
                  {label}
                </Button>
              ))}
            </ButtonGroup>
          </CardContent>
        </Card>
      </Box>      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Workout Totali"
            value={stats.totalWorkouts}
            icon={ActivityIcon}
            gradient="primary"
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Personal Records"
            value={stats.totalPRs}
            icon={TrophyIcon}
            gradient="secondary"
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Workout / Settimana"
            value={stats.avgWorkoutsPerWeek}
            icon={CalendarIcon}
            gradient="success"
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Trend"
            value={stats.recentPRs.length > 0 ? '↗️' : '→'}
            icon={TrendingUpIcon}
            gradient="warning"
          />
        </Grid>      </Grid>

      {/* Training Focus Visualization */}
      {stats.categoryDistribution.length > 0 && (
        <Card sx={{ ...commonStyles.glassCard, mb: 4 }}>
          <CardContent>
            <Typography variant="h6" color="text.primary" mb={3}>
              Focus Allenamento
            </Typography>
            <Grid container spacing={3}>
              {stats.categoryDistribution.slice(0, 4).map((category, index) => (
                <Grid size={{ xs: 6, md: 3 }} key={category.name}>
                  <Box textAlign="center">
                    <ProgressRing
                      percentage={category.percentage}
                      size={100}
                      strokeWidth={6}
                      color={COLORS[index % COLORS.length]}
                      label={`${category.percentage}%`}
                    />
                    <Typography variant="subtitle2" color="text.primary" mt={1}>
                      {category.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {category.value} workout
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Monthly Activity */}
      {stats.monthlyActivity.length > 0 && (
        <Card sx={{ ...commonStyles.glassCard, mb: 4 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <BarChart3Icon sx={{ color: colors.primary.main, mr: 1 }} />
              <Typography variant="h6" color="text.primary">
                Attività Mensile
              </Typography>
            </Box>
            <Box height="300px">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="month" stroke={colors.text.secondary} />
                  <YAxis stroke={colors.text.secondary} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: colors.background.card, 
                      border: `1px solid ${colors.primary.main}`,
                      color: colors.text.primary
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="workouts" 
                    stroke={colors.primary.main} 
                    fill={colors.primary.main} 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Strength Progress */}
        {stats.strengthProgress.length > 0 && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ ...commonStyles.glassCard }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <DumbbellIcon sx={{ color: colors.primary.main, mr: 1 }} />
                  <Typography variant="h6" color="text.primary">
                    Progressione Forza
                  </Typography>
                </Box>
                {stats.strengthProgress.map((lift, index) => (
                  <Box key={lift.exercise} mb={3}>
                    <Typography variant="subtitle1" color="text.primary" mb={1}>
                      {lift.exercise}
                    </Typography>
                    <Box height="150px">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lift.data}>
                          <XAxis dataKey="session" stroke={colors.text.secondary} fontSize={12} />
                          <YAxis stroke={colors.text.secondary} fontSize={12} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: colors.background.card, 
                              border: `1px solid ${colors.primary.main}`,
                              color: colors.text.primary,
                              fontSize: '12px'
                            }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="weight" 
                            stroke={COLORS[index % COLORS.length]} 
                            strokeWidth={2} 
                            dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Category Distribution */}
        {stats.categoryDistribution.length > 0 && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ ...commonStyles.glassCard }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <TargetIcon sx={{ color: colors.primary.main, mr: 1 }} />
                  <Typography variant="h6" color="text.primary">
                    Distribuzione Categorie
                  </Typography>
                </Box>
                <Box height="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                      >
                        {stats.categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: colors.background.card, 
                          border: `1px solid ${colors.primary.main}`,
                          color: colors.text.primary
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Benchmark Progress */}
      {stats.benchmarkProgress.length > 0 && (
        <Card sx={{ ...commonStyles.glassCard, mb: 4 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <ClockIcon sx={{ color: colors.primary.main, mr: 1 }} />
              <Typography variant="h6" color="text.primary">
                Progressione Benchmark
              </Typography>
            </Box>
            <Grid container spacing={3}>              {stats.benchmarkProgress.map((benchmark, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={benchmark.benchmark}>
                  <Typography variant="subtitle1" color="text.primary" mb={1}>
                    {benchmark.benchmark}
                  </Typography>
                  <Box height="200px">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={benchmark.data}>
                        <XAxis dataKey="attempt" stroke={colors.text.secondary} />
                        <YAxis stroke={colors.text.secondary} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: colors.background.card, 
                            border: `1px solid ${colors.primary.main}`,
                            color: colors.text.primary
                          }} 
                          formatter={(value) => [`${value} min`, 'Tempo']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="time" 
                          stroke={COLORS[index % COLORS.length]} 
                          strokeWidth={2} 
                          dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Recent PRs */}
      {stats.recentPRs.length > 0 && (
        <Card sx={{ ...commonStyles.glassCard, mb: 4 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <TrophyIcon sx={{ color: colors.primary.main, mr: 1 }} />
              <Typography variant="h6" color="text.primary">
                Personal Records Recenti
              </Typography>
            </Box>
            <List>
              {stats.recentPRs.map((pr, index) => (
                <Box key={index}>
                  <ListItem>
                    <ListItemIcon>
                      {pr.type === 'strength' ? 
                        <DumbbellIcon sx={{ color: colors.primary.main }} /> : 
                        <ClockIcon sx={{ color: colors.primary.main }} />
                      }
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" color="text.primary">
                          {pr.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {new Date(pr.date).toLocaleDateString('it-IT')}
                        </Typography>
                      }
                    />
                    <Box textAlign="right">
                      <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                        {pr.value}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.primary.main }}>
                        PR!
                      </Typography>
                    </Box>
                  </ListItem>
                  {index < stats.recentPRs.length - 1 && (
                    <Divider sx={{ bgcolor: 'rgba(0,0,0,0.1)' }} />
                  )}
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* No Data Message */}
      {stats.totalWorkouts === 0 && (
        <Card sx={{ ...commonStyles.glassCard }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <BarChart3Icon sx={{ fontSize: 64, color: colors.text.secondary, mb: 2 }} />
            <Typography variant="h5" color="text.primary" mb={1}>
              Nessun dato disponibile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Inizia ad aggiungere workout e benchmark per vedere le tue statistiche
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default Statistics
