import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  CircularProgress,
  Divider,
  Alert
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { 
  Add as AddIcon,
  DirectionsRun as RunIcon,
  DirectionsBike as BikeIcon,
  Pool as SwimIcon,
  FitnessCenter as RowIcon,
  FitnessCenter,
  DownhillSkiing as SkiIcon,
  Speed as AssaultBikeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material'
import { colors, commonStyles } from '../theme'
import MetricCard from '../components/MetricCard'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { logger } from '../utils/logger'

const ACTIVITY_TYPES = {
  run: { label: 'Corsa', icon: RunIcon, color: colors.secondary.main, unit: 'km' },
  bike: { label: 'Bici', icon: BikeIcon, color: colors.primary.main, unit: 'km' },
  rower: { label: 'Rower', icon: RowIcon, color: '#2196F3', unit: 'm' },
  skierg: { label: 'SkiErg', icon: SkiIcon, color: '#FF9800', unit: 'm' },
  assault_bike: { label: 'Assault Bike', icon: AssaultBikeIcon, color: '#F44336', unit: 'cal' },
  echo_bike: { label: 'Echo Bike', icon: AssaultBikeIcon, color: '#9C27B0', unit: 'cal' },
  air_bike: { label: 'Air Bike', icon: AssaultBikeIcon, color: '#607D8B', unit: 'cal' },
  swim: { label: 'Nuoto', icon: SwimIcon, color: '#00BCD4', unit: 'm' },
  other: { label: 'Altro', icon: FitnessCenter, color: colors.text.secondary, unit: '' }
}

const Cardio = () => {
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalPRs: 0,
    thisWeekActivities: 0,
    totalDistance: 0
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [formData, setFormData] = useState({
    activity_type: '',
    name: '',
    date: new Date(),
    duration_minutes: '',
    distance_km: '',
    elevation_gain_m: '',
    avg_heart_rate: '',
    max_heart_rate: '',
    avg_power_watts: '',
    avg_pace_per_km: '',
    avg_pace_per_500m: '',
    stroke_rate: '',
    calories_burned: '',
    total_calories: '',
    notes: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    loadCardioData()
  }, [user])

  const loadCardioData = async () => {
    try {
      const { data: cardioData, error } = await supabase
        .from('cardio_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error

      setActivities(cardioData || [])

      // Calculate stats
      const now = new Date()
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
      
      setStats({
        totalActivities: cardioData?.length || 0,
        totalPRs: cardioData?.filter(a => a.is_pr).length || 0,
        thisWeekActivities: cardioData?.filter(a => 
          new Date(a.date) >= weekStart
        ).length || 0,
        totalDistance: cardioData?.reduce((sum, a) => 
          sum + (a.distance_km || 0), 0
        ) || 0
      })    } catch (error) {
      logger.error('Error loading cardio data:', error)
      setError('Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveActivity = async () => {
    try {
      setError('')
      
      const activityData = {
        user_id: user.id,
        activity_type: formData.activity_type,
        name: formData.name || ACTIVITY_TYPES[formData.activity_type]?.label,
        date: format(formData.date, 'yyyy-MM-dd'),
        duration_minutes: parseInt(formData.duration_minutes),
        distance_km: formData.distance_km ? parseFloat(formData.distance_km) : null,
        elevation_gain_m: formData.elevation_gain_m ? parseInt(formData.elevation_gain_m) : null,
        avg_heart_rate: formData.avg_heart_rate ? parseInt(formData.avg_heart_rate) : null,
        max_heart_rate: formData.max_heart_rate ? parseInt(formData.max_heart_rate) : null,
        avg_power_watts: formData.avg_power_watts ? parseInt(formData.avg_power_watts) : null,
        stroke_rate: formData.stroke_rate ? parseInt(formData.stroke_rate) : null,
        calories_burned: formData.calories_burned ? parseInt(formData.calories_burned) : null,
        total_calories: formData.total_calories ? parseInt(formData.total_calories) : null,
        notes: formData.notes || null
      }

      let result
      if (editingActivity) {
        result = await supabase
          .from('cardio_activities')
          .update(activityData)
          .eq('id', editingActivity.id)
      } else {
        result = await supabase
          .from('cardio_activities')
          .insert([activityData])
      }

      if (result.error) throw result.error

      handleCloseDialog()
      loadCardioData()    } catch (error) {
      logger.error('Error saving activity:', error)
      setError('Errore nel salvataggio dell\'attività')
    }
  }

  const handleDeleteActivity = async (activity) => {
    if (window.confirm('Sei sicuro di voler eliminare questa attività?')) {
      try {
        const { error } = await supabase
          .from('cardio_activities')
          .delete()
          .eq('id', activity.id)

        if (error) throw error
        loadCardioData()      } catch (error) {
        logger.error('Error deleting activity:', error)
        setError('Errore nell\'eliminazione dell\'attività')
      }
    }
  }

  const handleOpenDialog = (activity = null) => {
    setEditingActivity(activity)
    setFormData(activity || {
      activity_type: '',
      name: '',
      date: new Date(),
      duration_minutes: '',
      distance_km: '',
      elevation_gain_m: '',
      avg_heart_rate: '',
      max_heart_rate: '',
      avg_power_watts: '',
      avg_pace_per_km: '',
      avg_pace_per_500m: '',
      stroke_rate: '',
      calories_burned: '',
      total_calories: '',
      notes: ''
    })
    setDialogOpen(true)
    setError('')
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingActivity(null)
    setError('')
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getActivityIcon = (type) => {
    const IconComponent = ACTIVITY_TYPES[type]?.icon || FitnessCenter
    return <IconComponent sx={{ color: ACTIVITY_TYPES[type]?.color }} />
  }

  const getActivityResult = (activity) => {
    const type = ACTIVITY_TYPES[activity.activity_type]
    
    if (activity.activity_type === 'rower' || activity.activity_type === 'skierg') {
      return `${activity.distance_km ? (activity.distance_km * 1000).toFixed(0) + 'm' : ''}`
    }
    
    if (activity.activity_type.includes('bike') && activity.activity_type !== 'bike') {
      return `${activity.total_calories || activity.calories_burned || ''}${activity.total_calories ? ' cal' : ''}`
    }
    
    return `${activity.distance_km ? activity.distance_km.toFixed(1) + ' km' : ''}`
  }

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="300px">
        <CircularProgress sx={{ color: colors.primary.main }} />
      </Box>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="700" color="text.primary" gutterBottom>
              Cardio Training
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Traccia le tue attività cardio e monitora i progressi
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              backgroundColor: colors.primary.main,
              color: 'black',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: colors.primary.dark,
              }
            }}
          >
            Nuova Attività
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <MetricCard
              title="Attività Totali"
              value={stats.totalActivities}
              icon={FitnessCenter}
              gradient={true}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <MetricCard
              title="PR Cardio"
              value={stats.totalPRs}
              icon={TrophyIcon}
              gradient={true}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <MetricCard
              title="Questa Settimana"
              value={stats.thisWeekActivities}
              icon={RunIcon}
              gradient={true}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <MetricCard
              title="Distanza Totale"
              value={`${stats.totalDistance.toFixed(1)} km`}
              icon={BikeIcon}
              gradient={true}
            />
          </Grid>
        </Grid>

        {/* Activities List */}
        <Card sx={{ ...commonStyles.glassCard }}>
          <CardContent>
            <Typography variant="h6" color="text.primary" mb={3}>
              Attività Recenti
            </Typography>
            {activities.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  Nessuna attività registrata ancora.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  sx={{ mt: 2 }}
                >
                  Aggiungi la prima attività
                </Button>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {activities.map((activity, index) => (
                  <Box key={activity.id}>
                    <ListItem
                      sx={{
                        px: 2,
                        py: 2,
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
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: `${ACTIVITY_TYPES[activity.activity_type]?.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {getActivityIcon(activity.activity_type)}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                        primary={
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <Typography variant="h6" component="span" fontWeight={600}>
                              {activity.name || ACTIVITY_TYPES[activity.activity_type]?.label}
                            </Typography>
                            {activity.is_pr && (
                              <Chip
                                label="PR"
                                size="small"
                                sx={{
                                  backgroundColor: colors.primary.main,
                                  color: 'black',
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold'
                                }}
                              />
                            )}
                            <Chip
                              label={ACTIVITY_TYPES[activity.activity_type]?.label}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: '0.65rem',
                                borderColor: ACTIVITY_TYPES[activity.activity_type]?.color,
                                color: ACTIVITY_TYPES[activity.activity_type]?.color
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Box display="flex" gap={2} mb={0.5}>
                              <Typography variant="body2" color="text.primary">
                                <strong>{formatDuration(activity.duration_minutes)}</strong>
                              </Typography>
                              {getActivityResult(activity) && (
                                <Typography variant="body2" color="text.primary">
                                  <strong>{getActivityResult(activity)}</strong>
                                </Typography>
                              )}
                              {activity.avg_heart_rate && (
                                <Typography variant="body2" color="text.secondary">
                                  ❤️ {activity.avg_heart_rate} bpm
                                </Typography>
                              )}
                              {activity.stroke_rate && (
                                <Typography variant="body2" color="text.secondary">
                                  {activity.stroke_rate} s/m
                                </Typography>
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(activity.date), 'EEEE, dd MMMM yyyy', { locale: it })}
                              {activity.notes && ` • ${activity.notes}`}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(activity)}
                          sx={{ color: colors.primary.main }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteActivity(activity)}
                          sx={{ color: colors.text.secondary }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </ListItem>
                    {index < activities.length - 1 && (
                      <Divider sx={{ bgcolor: 'rgba(0,0,0,0.05)', mx: 2 }} />
                    )}
                  </Box>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Activity Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingActivity ? 'Modifica Attività' : 'Nuova Attività Cardio'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo Attività</InputLabel>
                    <Select
                      value={formData.activity_type}
                      label="Tipo Attività"
                      onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                    >
                      {Object.entries(ACTIVITY_TYPES).map(([key, type]) => (
                        <MenuItem key={key} value={key}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <type.icon sx={{ color: type.color, fontSize: 20 }} />
                            {type.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Nome Attività (opzionale)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>                <Grid size={{ xs: 12, md: 6 }}>
                  <DatePicker
                    label="Data"
                    value={formData.date}
                    onChange={(date) => setFormData({ ...formData, date })}
                    slots={{
                      textField: TextField
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Durata (minuti)"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    required
                  />
                </Grid>
                
                {/* Distance field - hidden for calorie-based activities */}
                {!formData.activity_type.includes('bike') || formData.activity_type === 'bike' ? (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label={`Distanza (${formData.activity_type === 'rower' || formData.activity_type === 'skierg' ? 'km' : 'km'})`}
                      type="number"
                      value={formData.distance_km}
                      onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
                      inputProps={{ step: "0.1" }}
                    />
                  </Grid>
                ) : null}

                {/* Calories field for assault bikes */}
                {formData.activity_type.includes('bike') && formData.activity_type !== 'bike' ? (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Calorie Totali"
                      type="number"
                      value={formData.total_calories}
                      onChange={(e) => setFormData({ ...formData, total_calories: e.target.value })}
                    />
                  </Grid>
                ) : null}

                {/* Stroke rate for rower/skierg */}
                {(formData.activity_type === 'rower' || formData.activity_type === 'skierg') && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Stroke Rate (s/m)"
                      type="number"
                      value={formData.stroke_rate}
                      onChange={(e) => setFormData({ ...formData, stroke_rate: e.target.value })}
                    />
                  </Grid>
                )}

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Frequenza Cardiaca Media"
                    type="number"
                    value={formData.avg_heart_rate}
                    onChange={(e) => setFormData({ ...formData, avg_heart_rate: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Dislivello (m)"
                    type="number"
                    value={formData.elevation_gain_m}
                    onChange={(e) => setFormData({ ...formData, elevation_gain_m: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Note"
                    multiline
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annulla</Button>
            <Button 
              onClick={handleSaveActivity}
              variant="contained"
              disabled={!formData.activity_type || !formData.duration_minutes}
              sx={{
                backgroundColor: colors.primary.main,
                color: 'black',
                '&:hover': { backgroundColor: colors.primary.dark }
              }}
            >
              {editingActivity ? 'Aggiorna' : 'Salva'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  )
}

export default Cardio
