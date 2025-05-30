import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { 
  Box, 
  Typography, 
  Grid, 
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Chip
} from '@mui/material'
import { 
  EmojiEvents as TrophyIcon, 
  FitnessCenter as DumbbellIcon,
  Insights as TrendingUpIcon,
  TrackChanges as TargetIcon,
  AccessTime as ClockIcon,
  Add as AddIcon
} from '@mui/icons-material'
import { colors, commonStyles } from '../theme'
import MetricCard from '../components/MetricCard'
import ProgressRing from '../components/ProgressRing'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalPRs: 0,
    strengthPRs: 0,
    recentActivity: [],
    strengthProgress: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    try {
      // Get total PRs from benchmark results
      const { data: benchmarkPRs } = await supabase
        .from('benchmark_results')
        .select('*')
        .eq('is_pr', true)
        .eq('user_id', user.id)

      // Get strength PRs
      const { data: strengthPRs } = await supabase
        .from('strength_records')
        .select('*')
        .eq('is_pr', true)
        .eq('user_id', user.id)

      // Get recent activity
      const { data: recentBenchmarks } = await supabase
        .from('benchmark_results')
        .select(`
          *,
          benchmarks (name, category)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: recentStrength } = await supabase
        .from('strength_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Combine and sort recent activity
      const allActivity = [
        ...recentBenchmarks.map(item => ({
          ...item,
          type: 'benchmark',
          name: item.benchmarks.name,
          category: item.benchmarks.category
        })),
        ...recentStrength.map(item => ({
          ...item,
          type: 'strength',
          name: item.exercise
        }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)

      // Get strength progress data
      const { data: strengthData } = await supabase
        .from('strength_records')
        .select('exercise, estimated_1rm')
        .eq('user_id', user.id)
        .in('exercise', ['Back Squat', 'Deadlift', 'Bench Press', 'Overhead Press'])

      const strengthProgress = ['Back Squat', 'Deadlift', 'Bench Press', 'Overhead Press']
        .map(exercise => {
          const records = strengthData.filter(r => r.exercise === exercise)
          const maxWeight = records.length > 0 
            ? Math.max(...records.map(r => r.estimated_1rm)) 
            : 0
          return {
            name: exercise.replace(' 1RM', '').split(' ')[0],
            peso: maxWeight
          }
        })

      setStats({
        totalPRs: (benchmarkPRs?.length || 0) + (strengthPRs?.length || 0),
        strengthPRs: strengthPRs?.length || 0,
        recentActivity: allActivity,
        strengthProgress
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="300px">
        <CircularProgress sx={{ color: colors.primary.main }} />
      </Box>
    )
  }

  return (
    <Box sx={{ py: 3 }}>
      {/* Welcome */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="700" color="text.primary" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Panoramica dei tuoi progressi CrossFit
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard
            title="PR Totali"
            value={stats.totalPRs}
            icon={TrophyIcon}
            trend="up"
            trendValue="+12%"
            gradient={true}
          />
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard
            title="Strength PRs"
            value={stats.strengthPRs}
            icon={DumbbellIcon}
            trend="up"
            trendValue="+5"
          />
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard
            title="WODs Recenti"
            value={stats.recentActivity.length}
            icon={TargetIcon}
            trend="flat"
          />
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard
            title="Streak Giorni"
            value="7"
            icon={TrendingUpIcon}
            trend="up"
            trendValue="+2"
          />
        </Grid>
      </Grid>

      {/* Strength Progress Chart */}
      {stats.strengthProgress.some(s => s.peso > 0) && (
        <Card sx={{ ...commonStyles.glassCard, p: 2, mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <DumbbellIcon sx={{ color: colors.primary.main, mr: 1 }} />
              <Typography variant="h6" color="text.primary">
                Massimali Attuali
              </Typography>
            </Box>
            <Box height="300px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.strengthProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="name" stroke={colors.text.secondary} />
                  <YAxis stroke={colors.text.secondary} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: colors.background.card, 
                      border: `1px solid ${colors.primary.main}`,
                      color: colors.text.primary
                    }} 
                  />
                  <Bar dataKey="peso" fill={colors.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <Card sx={{ ...commonStyles.glassCard }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Box display="flex" alignItems="center">
                <ClockIcon sx={{ color: colors.primary.main, mr: 1 }} />
                <Typography variant="h6" color="text.primary">
                  Attività Recenti
                </Typography>
              </Box>
              <Chip
                label={`${stats.recentActivity.length} attività`}
                size="small"
                sx={{
                  backgroundColor: `${colors.primary.main}20`,
                  color: colors.text.primary,
                  fontWeight: 500
                }}
              />
            </Box>
            <List sx={{ p: 0 }}>
              {stats.recentActivity.map((activity, index) => (
                <Box key={`activity-${index}-${activity.id || activity.created_at}`}>
                  <ListItem 
                    sx={{ 
                      px: 2,
                      py: 1.5,
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 215, 0, 0.05)',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          backgroundColor: activity.type === 'benchmark' 
                            ? `${colors.secondary.main}15` 
                            : `${colors.primary.main}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {activity.type === 'benchmark' ? (
                          <TargetIcon sx={{ 
                            fontSize: 16, 
                            color: colors.secondary.main 
                          }} />
                        ) : (
                          <DumbbellIcon sx={{ 
                            fontSize: 16, 
                            color: colors.primary.main 
                          }} />
                        )}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" color="text.primary" fontWeight={600}>
                            {activity.name}
                          </Typography>
                          {activity.is_pr && (
                            <Chip
                              label="PR"
                              size="small"
                              sx={{
                                backgroundColor: colors.primary.main,
                                color: 'black',
                                fontSize: '0.7rem',
                                height: 20,
                                fontWeight: 'bold'
                              }}
                            />
                          )}
                          <Chip
                            label={activity.type === 'benchmark' ? 'WOD' : 'Strength'}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: '0.65rem',
                              height: 18,
                              borderColor: activity.type === 'benchmark' 
                                ? colors.secondary.main 
                                : colors.primary.main,
                              color: activity.type === 'benchmark' 
                                ? colors.secondary.main 
                                : colors.primary.main
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box mt={0.5}>
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            {activity.type === 'benchmark' 
                              ? `${activity.result || activity.score} ${activity.unit || ''}`
                              : `${activity.weight} kg × ${activity.reps} reps${activity.estimated_1rm ? ` (1RM: ${activity.estimated_1rm}kg)` : ''}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(activity.created_at).toLocaleDateString('it-IT', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {activity.category && ` • ${activity.category}`}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < stats.recentActivity.length - 1 && (
                    <Divider sx={{ bgcolor: 'rgba(0,0,0,0.05)', mx: 2 }} />
                  )}
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default Dashboard
