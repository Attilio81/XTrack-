
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
  DirectionsRun as ActivityIcon,
  Speed as SpeedIcon,
  Balance as BalanceIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon
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
    recentPRs: [],
    // Nuove statistiche CrossFit-specific
    volumeLoad: [],
    movementPatterns: [],
    strengthToBodyweightRatios: {},
    intensityDistribution: [],
    weeklyVolume: 0,
    consistencyScore: 0,
    improvementRate: 0,
    dominantMovements: [],
    weekdayDistribution: [],
    bestPerformancePeriod: {},
    strengthBalance: {}
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
    const monthlyActivity = getMonthlyActivity(benchmarkResults, strengthRecords)    // Recent PRs
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

    // Nuove statistiche CrossFit-specific
    const crossfitStats = calculateCrossfitStats(benchmarkResults, strengthRecords, bodyMetrics)

    return {
      totalWorkouts,
      totalPRs,
      avgWorkoutsPerWeek,
      strengthProgress,
      benchmarkProgress,
      categoryDistribution,
      monthlyActivity,
      recentPRs: allPRs,
      ...crossfitStats
    }  }

  const calculateCrossfitStats = (benchmarkResults, strengthRecords, bodyMetrics) => {
    // Volume Load - Carico di lavoro nel tempo
    const volumeLoad = calculateVolumeLoad(strengthRecords)
    
    // Movement Patterns Analysis
    const movementPatterns = analyzeMovementPatterns(benchmarkResults, strengthRecords)
    
    // Strength to Bodyweight Ratios
    const strengthToBodyweightRatios = calculateStrengthRatios(strengthRecords, bodyMetrics)
    
    // Intensity Distribution
    const intensityDistribution = analyzeIntensityDistribution(benchmarkResults, strengthRecords)
    
    // Weekly Volume
    const weeklyVolume = calculateWeeklyVolume(strengthRecords)
    
    // Consistency Score (0-100)
    const consistencyScore = calculateConsistencyScore(benchmarkResults, strengthRecords)
    
    // Improvement Rate (% improvement over time)
    const improvementRate = calculateImprovementRate(strengthRecords)
    
    // Dominant Movements
    const dominantMovements = analyzeDominantMovements(benchmarkResults, strengthRecords)
    
    // Weekday Distribution
    const weekdayDistribution = analyzeWeekdayDistribution(benchmarkResults, strengthRecords)
    
    // Best Performance Period
    const bestPerformancePeriod = findBestPerformancePeriod(benchmarkResults, strengthRecords)
    
    // Strength Balance (equilibrio tra gruppi muscolari)
    const strengthBalance = analyzeStrengthBalance(strengthRecords)

    return {
      volumeLoad,
      movementPatterns,
      strengthToBodyweightRatios,
      intensityDistribution,
      weeklyVolume,
      consistencyScore,
      improvementRate,
      dominantMovements,
      weekdayDistribution,
      bestPerformancePeriod,
      strengthBalance
    }
  }

  const calculateVolumeLoad = (strengthRecords) => {
    const weeklyVolume = {}
    
    strengthRecords.forEach(record => {
      const weekKey = getWeekKey(record.date)
      const volume = record.weight * record.reps * record.sets || 0
      weeklyVolume[weekKey] = (weeklyVolume[weekKey] || 0) + volume
    })

    return Object.entries(weeklyVolume)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, volume]) => ({
        week: formatWeekDisplay(week),
        volume: Math.round(volume),
        date: week
      }))
  }

  const analyzeMovementPatterns = (benchmarkResults, strengthRecords) => {
    const patterns = {
      'Squat Pattern': ['Back Squat', 'Front Squat', 'Overhead Squat', 'Box Jump'],
      'Hinge Pattern': ['Deadlift', 'Romanian Deadlift', 'Kettlebell Swing'],
      'Push Pattern': ['Bench Press', 'Overhead Press', 'Push Press', 'Handstand Push-up'],
      'Pull Pattern': ['Pull-up', 'Chin-up', 'Row', 'Muscle-up'],
      'Olympic Lifts': ['Clean', 'Jerk', 'Snatch', 'Clean & Jerk'],
      'Monostructural': ['Run', 'Row', 'Bike', 'Swim']
    }

    const patternCounts = {}
    
    // Analizza strength records
    strengthRecords.forEach(record => {
      Object.entries(patterns).forEach(([pattern, exercises]) => {
        if (exercises.some(exercise => record.exercise.includes(exercise))) {
          patternCounts[pattern] = (patternCounts[pattern] || 0) + 1
        }
      })
    })

    // Analizza benchmark results
    benchmarkResults.forEach(result => {
      const benchmarkName = result.benchmarks?.name || ''
      // Classifica benchmark in base ai movimenti predominanti
      if (['Fran', 'Grace', 'Isabel'].includes(benchmarkName)) {
        patternCounts['Olympic Lifts'] = (patternCounts['Olympic Lifts'] || 0) + 1
      } else if (['Helen', 'Angie', 'Eva'].includes(benchmarkName)) {
        patternCounts['Monostructural'] = (patternCounts['Monostructural'] || 0) + 1
      }
    })

    return Object.entries(patternCounts)
      .map(([pattern, count]) => ({
        pattern,
        count,
        percentage: Math.round((count / (strengthRecords.length + benchmarkResults.length)) * 100)
      }))
      .sort((a, b) => b.count - a.count)
  }

  const calculateStrengthRatios = (strengthRecords, bodyMetrics) => {
    const latestBodyweight = bodyMetrics?.[bodyMetrics.length - 1]?.weight || 70 // default 70kg
    const latestLifts = {}
    
    // Trova i pesi più recenti per ogni esercizio
    strengthRecords.forEach(record => {
      if (!latestLifts[record.exercise] || new Date(record.date) > new Date(latestLifts[record.exercise].date)) {
        latestLifts[record.exercise] = record
      }
    })

    const ratios = {}
    const keyLifts = ['Back Squat', 'Deadlift', 'Bench Press', 'Overhead Press']
    
    keyLifts.forEach(lift => {
      if (latestLifts[lift]) {
        ratios[lift] = {
          absolute: latestLifts[lift].estimated_1rm || latestLifts[lift].weight,
          ratio: Math.round(((latestLifts[lift].estimated_1rm || latestLifts[lift].weight) / latestBodyweight) * 100) / 100
        }
      }
    })

    return ratios
  }

  const analyzeIntensityDistribution = (benchmarkResults, strengthRecords) => {
    const intensityBuckets = {
      'Bassa (60-70%)': 0,
      'Moderata (70-80%)': 0,
      'Alta (80-90%)': 0,
      'Massimale (90%+)': 0
    }

    // Analizza intensity degli strength records basandosi sul % di 1RM
    strengthRecords.forEach(record => {
      if (record.estimated_1rm && record.weight) {
        const percentage = (record.weight / record.estimated_1rm) * 100
        if (percentage >= 90) intensityBuckets['Massimale (90%+)']++
        else if (percentage >= 80) intensityBuckets['Alta (80-90%)']++
        else if (percentage >= 70) intensityBuckets['Moderata (70-80%)']++
        else intensityBuckets['Bassa (60-70%)']++
      }
    })

    return Object.entries(intensityBuckets).map(([intensity, count]) => ({
      intensity,
      count,
      percentage: Math.round((count / strengthRecords.length) * 100) || 0
    }))
  }

  const calculateWeeklyVolume = (strengthRecords) => {
    const currentWeek = getWeekKey(new Date().toISOString())
    const currentWeekRecords = strengthRecords.filter(record => 
      getWeekKey(record.date) === currentWeek
    )
    
    return currentWeekRecords.reduce((total, record) => {
      return total + (record.weight * record.reps * record.sets || 0)
    }, 0)
  }

  const calculateConsistencyScore = (benchmarkResults, strengthRecords) => {
    const allWorkouts = [...benchmarkResults, ...strengthRecords]
    if (allWorkouts.length === 0) return 0

    const weeks = {}
    allWorkouts.forEach(workout => {
      const weekKey = getWeekKey(workout.date)
      weeks[weekKey] = (weeks[weekKey] || 0) + 1
    })

    const weekValues = Object.values(weeks)
    const avgWorkoutsPerWeek = weekValues.reduce((a, b) => a + b, 0) / weekValues.length
    const variance = weekValues.reduce((acc, val) => acc + Math.pow(val - avgWorkoutsPerWeek, 2), 0) / weekValues.length
    const standardDeviation = Math.sqrt(variance)
    
    // Score basato sulla variabilità: meno variabilità = più consistenza
    const consistencyScore = Math.max(0, 100 - (standardDeviation / avgWorkoutsPerWeek) * 50)
    return Math.round(consistencyScore)
  }

  const calculateImprovementRate = (strengthRecords) => {
    const exerciseProgress = {}
    
    strengthRecords.forEach(record => {
      if (!exerciseProgress[record.exercise]) {
        exerciseProgress[record.exercise] = []
      }
      exerciseProgress[record.exercise].push({
        date: record.date,
        weight: record.estimated_1rm || record.weight
      })
    })

    let totalImprovementRate = 0
    let exerciseCount = 0

    Object.values(exerciseProgress).forEach(records => {
      if (records.length >= 2) {
        records.sort((a, b) => new Date(a.date) - new Date(b.date))
        const firstWeight = records[0].weight
        const lastWeight = records[records.length - 1].weight
        const improvementRate = ((lastWeight - firstWeight) / firstWeight) * 100
        totalImprovementRate += improvementRate
        exerciseCount++
      }
    })

    return exerciseCount > 0 ? Math.round(totalImprovementRate / exerciseCount) : 0
  }

  const analyzeDominantMovements = (benchmarkResults, strengthRecords) => {
    const movementCounts = {}
    
    strengthRecords.forEach(record => {
      movementCounts[record.exercise] = (movementCounts[record.exercise] || 0) + 1
    })

    benchmarkResults.forEach(result => {
      const name = result.benchmarks?.name || 'Unknown'
      movementCounts[name] = (movementCounts[name] || 0) + 1
    })

    return Object.entries(movementCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([movement, count]) => ({ movement, count }))
  }

  const analyzeWeekdayDistribution = (benchmarkResults, strengthRecords) => {
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
    const distribution = Array(7).fill(0)
    
    const allWorkouts = [...benchmarkResults, ...strengthRecords]
    
    allWorkouts.forEach(workout => {
      const dayOfWeek = new Date(workout.date).getDay()
      distribution[dayOfWeek]++
    })

    return weekdays.map((day, index) => ({
      day,
      count: distribution[index],
      percentage: allWorkouts.length > 0 ? Math.round((distribution[index] / allWorkouts.length) * 100) : 0
    }))
  }

  const findBestPerformancePeriod = (benchmarkResults, strengthRecords) => {
    const periods = {}
    const allPRs = [
      ...benchmarkResults.filter(r => r.is_pr),
      ...strengthRecords.filter(r => r.is_pr)
    ]

    allPRs.forEach(pr => {
      const monthKey = pr.date.substring(0, 7) // YYYY-MM
      periods[monthKey] = (periods[monthKey] || 0) + 1
    })

    if (Object.keys(periods).length === 0) return { period: null, count: 0 }

    const bestPeriod = Object.entries(periods)
      .sort(([,a], [,b]) => b - a)[0]

    return {
      period: new Date(bestPeriod[0] + '-01').toLocaleDateString('it-IT', { 
        month: 'long', 
        year: 'numeric' 
      }),
      count: bestPeriod[1]
    }
  }

  const analyzeStrengthBalance = (strengthRecords) => {
    const muscleGroups = {
      'Quadricipiti': ['Back Squat', 'Front Squat', 'Leg Press'],
      'Posteriori': ['Deadlift', 'Romanian Deadlift', 'Good Morning'],
      'Petto': ['Bench Press', 'Incline Press', 'Dips'],
      'Spalle': ['Overhead Press', 'Push Press', 'Lateral Raise'],
      'Schiena': ['Pull-up', 'Row', 'Lat Pulldown'],
      'Core': ['Plank', 'Sit-up', 'Russian Twist']
    }

    const groupStrength = {}
    
    Object.entries(muscleGroups).forEach(([group, exercises]) => {
      const groupRecords = strengthRecords.filter(record => 
        exercises.some(exercise => record.exercise.includes(exercise))
      )
      
      if (groupRecords.length > 0) {
        const avgStrength = groupRecords.reduce((sum, record) => 
          sum + (record.estimated_1rm || record.weight), 0
        ) / groupRecords.length
        
        groupStrength[group] = Math.round(avgStrength)
      }
    })

    return groupStrength
  }

  const getWeekKey = (dateString) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const weekNumber = getWeekNumber(date)
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`
  }

  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  }

  const formatWeekDisplay = (weekKey) => {
    const [year, week] = weekKey.split('-W')
    return `S${week}/${year.slice(-2)}`
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
        <Grid size={{ xs: 12, md: 2.4 }}>
          <MetricCard
            title="Workout Totali"
            value={stats.totalWorkouts}
            icon={ActivityIcon}
            gradient="primary"
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 2.4 }}>
          <MetricCard
            title="Personal Records"
            value={stats.totalPRs}
            icon={TrophyIcon}
            gradient="secondary"
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 2.4 }}>
          <MetricCard
            title="Workout / Settimana"
            value={stats.avgWorkoutsPerWeek}
            icon={CalendarIcon}
            gradient="success"
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 2.4 }}>
          <MetricCard
            title="Consistenza"
            value={`${stats.consistencyScore}%`}
            icon={TargetIcon}
            gradient="warning"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2.4 }}>
          <MetricCard
            title="Miglioramento"
            value={`${stats.improvementRate > 0 ? '+' : ''}${stats.improvementRate}%`}
            icon={TrendingUpIcon}
            gradient="info"
          />
        </Grid>
      </Grid>

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
        </Card>      )}

      {/* Strength to Bodyweight Ratios */}
      {Object.keys(stats.strengthToBodyweightRatios).length > 0 && (
        <Card sx={{ ...commonStyles.glassCard, mb: 4 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={3}>
              <BalanceIcon sx={{ color: colors.primary.main, mr: 1 }} />
              <Typography variant="h6" color="text.primary">
                Rapporti Forza/Peso
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {Object.entries(stats.strengthToBodyweightRatios).map(([exercise, data]) => (
                <Grid size={{ xs: 6, md: 3 }} key={exercise}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                      {data.ratio}x
                    </Typography>
                    <Typography variant="subtitle2" color="text.primary" mt={1}>
                      {exercise.split(' ')[0]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {data.absolute}kg
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Movement Patterns Analysis */}
      {stats.movementPatterns.length > 0 && (
        <Card sx={{ ...commonStyles.glassCard, mb: 4 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={3}>
              <SpeedIcon sx={{ color: colors.primary.main, mr: 1 }} />
              <Typography variant="h6" color="text.primary">
                Analisi Pattern di Movimento
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {stats.movementPatterns.map((pattern, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={pattern.pattern}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" p={2} 
                       sx={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" color="text.primary">
                        {pattern.pattern}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {pattern.count} sessioni
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="h6" fontWeight="bold" 
                                  sx={{ color: COLORS[index % COLORS.length] }}>
                        {pattern.percentage}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Volume Load Trend */}
      {stats.volumeLoad.length > 0 && (
        <Card sx={{ ...commonStyles.glassCard, mb: 4 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <TimelineIcon sx={{ color: colors.primary.main, mr: 1 }} />
              <Typography variant="h6" color="text.primary">
                Volume di Carico Settimanale
              </Typography>
            </Box>
            <Box height="300px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.volumeLoad}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="week" stroke={colors.text.secondary} />
                  <YAxis stroke={colors.text.secondary} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: colors.background.card, 
                      border: `1px solid ${colors.primary.main}`,
                      color: colors.text.primary
                    }}
                    formatter={(value) => [`${value} kg`, 'Volume']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke={colors.primary.main} 
                    strokeWidth={3} 
                    dot={{ fill: colors.primary.main, strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Intensity Distribution */}
      {stats.intensityDistribution.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ ...commonStyles.glassCard }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AssessmentIcon sx={{ color: colors.primary.main, mr: 1 }} />
                  <Typography variant="h6" color="text.primary">
                    Distribuzione Intensità
                  </Typography>
                </Box>
                <Box height="250px">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.intensityDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="intensity" stroke={colors.text.secondary} fontSize={10} />
                      <YAxis stroke={colors.text.secondary} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: colors.background.card, 
                          border: `1px solid ${colors.primary.main}`,
                          color: colors.text.primary
                        }} 
                      />
                      <Bar dataKey="count" fill={colors.primary.main} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Weekday Distribution */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ ...commonStyles.glassCard }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <CalendarIcon sx={{ color: colors.primary.main, mr: 1 }} />
                  <Typography variant="h6" color="text.primary">
                    Distribuzione Giorni della Settimana
                  </Typography>
                </Box>
                <Box height="250px">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.weekdayDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="day" stroke={colors.text.secondary} />
                      <YAxis stroke={colors.text.secondary} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: colors.background.card, 
                          border: `1px solid ${colors.primary.main}`,
                          color: colors.text.primary
                        }} 
                      />
                      <Bar dataKey="count" fill={colors.secondary?.main || colors.primary.main} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Strength Balance & Best Performance Period */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Strength Balance */}
        {Object.keys(stats.strengthBalance).length > 0 && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ ...commonStyles.glassCard }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <BalanceIcon sx={{ color: colors.primary.main, mr: 1 }} />
                  <Typography variant="h6" color="text.primary">
                    Equilibrio Muscolare
                  </Typography>
                </Box>
                <List>                  {Object.entries(stats.strengthBalance).map(([group, strength], index) => (
                    <ListItem key={group}>
                      <ListItemText
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                        primary={
                          <Box 
                            component="span"
                            sx={{ 
                              fontSize: '1rem',
                              fontWeight: 500,
                              color: 'text.primary',
                              lineHeight: 1.5
                            }}
                          >
                            {group}
                          </Box>
                        }
                        secondary={
                          <Box display="flex" alignItems="center" mt={1}>
                            <Box 
                              sx={{ 
                                width: `${Math.min((strength / Math.max(...Object.values(stats.strengthBalance))) * 100, 100)}%`,
                                height: 8,
                                backgroundColor: COLORS[index % COLORS.length],
                                borderRadius: 4,
                                mr: 2
                              }} 
                            />
                            <Box 
                              component="span"
                              sx={{ 
                                fontSize: '0.875rem',
                                color: 'text.secondary',
                                lineHeight: 1.4
                              }}
                            >
                              {strength}kg
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Dominant Movements & Best Period */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ ...commonStyles.glassCard }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrophyIcon sx={{ color: colors.primary.main, mr: 1 }} />
                <Typography variant="h6" color="text.primary">
                  Movimenti Dominanti
                </Typography>
              </Box>
              <List>                {stats.dominantMovements.slice(0, 5).map((movement, index) => (
                  <ListItem key={movement.movement}>
                    <ListItemText
                      primaryTypographyProps={{ component: 'div' }}
                      secondaryTypographyProps={{ component: 'div' }}
                      primary={
                        <Box 
                          component="span"
                          sx={{ 
                            fontSize: '1rem',
                            fontWeight: 500,
                            color: 'text.primary',
                            lineHeight: 1.5
                          }}
                        >
                          {movement.movement}
                        </Box>
                      }
                      secondary={
                        <Box 
                          component="span"
                          sx={{ 
                            fontSize: '0.875rem',
                            color: 'text.secondary',
                            lineHeight: 1.4
                          }}
                        >
                          {movement.count} sessioni
                        </Box>
                      }
                    />
                    <Typography variant="h6" fontWeight="bold" 
                                sx={{ color: COLORS[index % COLORS.length] }}>
                      #{index + 1}
                    </Typography>
                  </ListItem>
                ))}
              </List>
              
              {stats.bestPerformancePeriod.period && (
                <Box mt={3} p={2} sx={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Miglior Periodo di Performance
                  </Typography>
                  <Typography variant="h6" color="text.primary">
                    {stats.bestPerformancePeriod.period}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats.bestPerformancePeriod.count} PR raggiunti
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
                    </ListItemIcon>                    <ListItemText
                      primaryTypographyProps={{ component: 'div' }}
                      secondaryTypographyProps={{ component: 'div' }}
                      primary={
                        <Box 
                          component="span"
                          sx={{ 
                            fontSize: '1rem',
                            fontWeight: 500,
                            color: 'text.primary',
                            lineHeight: 1.5
                          }}
                        >
                          {pr.name}
                        </Box>
                      }
                      secondary={
                        <Box 
                          component="span"
                          sx={{ 
                            fontSize: '0.875rem',
                            color: 'text.secondary',
                            lineHeight: 1.4
                          }}
                        >
                          {new Date(pr.date).toLocaleDateString('it-IT')}
                        </Box>
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
