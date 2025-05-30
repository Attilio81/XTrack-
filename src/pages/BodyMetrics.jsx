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
  TextField,
  FormControl,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material'
import { 
  Person as UserIcon, 
  Add as PlusIcon, 
  Close as CloseIcon, 
  FitnessCenter as ScaleIcon, 
  Favorite as HeartIcon, 
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon, 
  TrackChanges as TargetIcon, 
  DirectionsRun as ActivityIcon, 
  FlashOn as ZapIcon 
} from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { colors, commonStyles } from '../theme'
import MetricCard from '../components/MetricCard'
import ProgressRing from '../components/ProgressRing'

const BodyMetrics = () => {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState([])
  const [measurements, setMeasurements] = useState([])
  const [activeTab, setActiveTab] = useState('weight')
  const [showMetricsForm, setShowMetricsForm] = useState(false)
  const [showMeasurementsForm, setShowMeasurementsForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const [metricsForm, setMetricsForm] = useState({
    weight: '',
    body_fat_percent: '',
    muscle_mass_kg: '',
    resting_hr: '',
    blood_pressure_sys: '',
    blood_pressure_dia: '',
    vo2_max: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const [measurementsForm, setMeasurementsForm] = useState({
    bicep_cm: '',
    chest_cm: '',
    waist_cm: '',
    hips_cm: '',
    thigh_cm: '',
    neck_cm: '',
    forearm_cm: '',
    calf_cm: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  useEffect(() => {
    loadBodyData()
  }, [])

  const loadBodyData = async () => {
    try {
      const [metricsData, measurementsData] = await Promise.all([
        supabase
          .from('body_metrics')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false }),
        supabase
          .from('body_measurements')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
      ])

      setMetrics(metricsData.data || [])
      setMeasurements(measurementsData.data || [])
    } catch (error) {
      console.error('Error loading body data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMetricsSubmit = async (e) => {
    e.preventDefault()
    try {
      const formData = { ...metricsForm, user_id: user.id }
      
      // Remove empty fields
      Object.keys(formData).forEach(key => {
        if (formData[key] === '') {
          delete formData[key]
        }
      })

      const { error } = await supabase
        .from('body_metrics')
        .upsert(formData, { onConflict: 'user_id,date' })

      if (error) throw error

      await loadBodyData()
      setShowMetricsForm(false)
      setMetricsForm({
        weight: '',
        body_fat_percent: '',
        muscle_mass_kg: '',
        resting_hr: '',
        blood_pressure_sys: '',
        blood_pressure_dia: '',
        vo2_max: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      })
    } catch (error) {
      console.error('Error saving metrics:', error)
    }
  }

  const handleMeasurementsSubmit = async (e) => {
    e.preventDefault()
    try {
      const formData = { ...measurementsForm, user_id: user.id }
      
      // Remove empty fields
      Object.keys(formData).forEach(key => {
        if (formData[key] === '') {
          delete formData[key]
        }
      })

      const { error } = await supabase
        .from('body_measurements')
        .upsert(formData, { onConflict: 'user_id,date' })

      if (error) throw error

      await loadBodyData()
      setShowMeasurementsForm(false)
      setMeasurementsForm({
        bicep_cm: '',
        chest_cm: '',
        waist_cm: '',
        hips_cm: '',
        thigh_cm: '',
        neck_cm: '',
        forearm_cm: '',
        calf_cm: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      })
    } catch (error) {
      console.error('Error saving measurements:', error)
    }
  }

  const getWeightData = () => {
    return metrics
      .filter(m => m.weight)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(m => ({
        date: m.date,
        weight: parseFloat(m.weight),
        formattedDate: new Date(m.date).toLocaleDateString('it-IT', { 
          month: 'short', 
          day: 'numeric' 
        })
      }))
  }

  const getBodyFatData = () => {
    return metrics
      .filter(m => m.body_fat_percent)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(m => ({
        date: m.date,
        bodyFat: parseFloat(m.body_fat_percent),
        formattedDate: new Date(m.date).toLocaleDateString('it-IT', { 
          month: 'short', 
          day: 'numeric' 
        })
      }))
  }

  const getCurrentStats = () => {
    const latestMetrics = metrics[0]
    const latestMeasurements = measurements[0]
    
    return {
      weight: latestMetrics?.weight || null,
      bodyFat: latestMetrics?.body_fat_percent || null,
      restingHR: latestMetrics?.resting_hr || null,
      vo2Max: latestMetrics?.vo2_max || null,
      waist: latestMeasurements?.waist_cm || null,
      chest: latestMeasurements?.chest_cm || null
    }
  }

  const weightData = getWeightData()
  const bodyFatData = getBodyFatData()
  const currentStats = getCurrentStats()

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
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="700" color="text.primary" gutterBottom>
          Body Metrics
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Traccia peso, composizione corporea e salute
        </Typography>
      </Box>      {/* Current Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, md: 2 }}>
          <MetricCard
            title="Peso"
            value={currentStats.weight ? `${currentStats.weight}kg` : 'N/A'}
            icon={ScaleIcon}
            gradient="primary"
          />
        </Grid>
        
        <Grid size={{ xs: 6, md: 2 }}>
          <MetricCard
            title="Body Fat"
            value={currentStats.bodyFat ? `${currentStats.bodyFat}%` : 'N/A'}
            icon={TargetIcon}
            gradient="secondary"
          />
        </Grid>
        
        <Grid size={{ xs: 6, md: 2 }}>
          <MetricCard
            title="FC Riposo"
            value={currentStats.restingHR ? `${currentStats.restingHR}bpm` : 'N/A'}
            icon={HeartIcon}
            gradient="success"
          />
        </Grid>
        
        <Grid size={{ xs: 6, md: 2 }}>
          <MetricCard
            title="VO2 Max"
            value={currentStats.vo2Max ? `${currentStats.vo2Max}` : 'N/A'}
            icon={ActivityIcon}
            gradient="warning"
          />
        </Grid>
        
        <Grid size={{ xs: 6, md: 2 }}>
          <MetricCard
            title="Vita"
            value={currentStats.waist ? `${currentStats.waist}cm` : 'N/A'}
            icon={UserIcon}
            gradient="info"
          />
        </Grid>
        
        <Grid size={{ xs: 6, md: 2 }}>
          <MetricCard
            title="Petto"
            value={currentStats.chest ? `${currentStats.chest}cm` : 'N/A'}
            icon={ZapIcon}
            gradient="error"
          />
        </Grid>      </Grid>

      {/* Progress Rings for Key Metrics */}
      {(currentStats.bodyFat || currentStats.restingHR || currentStats.vo2Max) && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {currentStats.bodyFat && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ ...commonStyles.glassCard, textAlign: 'center', p: 3 }}>
                <Typography variant="h6" color="text.primary" mb={2}>
                  Body Fat %
                </Typography>
                <ProgressRing
                  percentage={Math.min(currentStats.bodyFat, 30)} // Cap at 30% for visualization
                  size={120}
                  strokeWidth={8}
                  color={colors.secondary.main}
                  label={`${currentStats.bodyFat}%`}
                />
              </Card>
            </Grid>
          )}
          
          {currentStats.restingHR && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ ...commonStyles.glassCard, textAlign: 'center', p: 3 }}>
                <Typography variant="h6" color="text.primary" mb={2}>
                  FC Riposo
                </Typography>
                <ProgressRing
                  percentage={Math.max(0, 100 - ((currentStats.restingHR - 40) / 60) * 100)} // Lower HR = better
                  size={120}
                  strokeWidth={8}
                  color={colors.success.main}
                  label={`${currentStats.restingHR}bpm`}
                />
              </Card>
            </Grid>
          )}
          
          {currentStats.vo2Max && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ ...commonStyles.glassCard, textAlign: 'center', p: 3 }}>
                <Typography variant="h6" color="text.primary" mb={2}>
                  VO2 Max
                </Typography>
                <ProgressRing
                  percentage={Math.min((currentStats.vo2Max / 60) * 100, 100)} // Scale to 60 as excellent
                  size={120}
                  strokeWidth={8}
                  color={colors.warning.main}
                  label={`${currentStats.vo2Max}`}
                />
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Tabs */}
      <Card sx={{ ...commonStyles.glassCard }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                color: colors.text.secondary,
                '&.Mui-selected': {
                  color: colors.primary.main
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: colors.primary.main
              }
            }}
          >
            <Tab label="Peso & Salute" value="weight" />
            <Tab label="Circonferenze" value="measurements" />
          </Tabs>
        </Box>

        <CardContent>
          {activeTab === 'weight' && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" color="text.primary">
                  Metriche Corporee
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PlusIcon />}
                  onClick={() => setShowMetricsForm(true)}
                  sx={{
                    backgroundColor: colors.primary.main,
                    color: 'black',
                    '&:hover': {
                      backgroundColor: colors.primary.dark
                    }
                  }}
                >
                  Aggiungi
                </Button>
              </Box>

              {/* Weight Chart */}
              {weightData.length > 0 && (
                <Card sx={{ ...commonStyles.glassCard, mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" color="text.primary" mb={2}>
                      Andamento Peso
                    </Typography>
                    <Box height="300px">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weightData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                          <XAxis dataKey="formattedDate" stroke={colors.text.secondary} />
                          <YAxis stroke={colors.text.secondary} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: colors.background.card, 
                              border: `1px solid ${colors.primary.main}`,
                              color: colors.text.primary
                            }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="weight" 
                            stroke={colors.primary.main} 
                            strokeWidth={2} 
                            dot={{ fill: colors.primary.main, strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Recent Metrics */}
              <Typography variant="h6" color="text.primary" mb={2}>
                Metriche Recenti
              </Typography>
              {metrics.length === 0 ? (
                <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                  Nessuna metrica registrata. Inizia a tracciare i tuoi progressi!
                </Typography>
              ) : (
                <List>
                  {metrics.slice(0, 5).map((metric, index) => (
                    <Box key={metric.id}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" color="text.primary">
                              {new Date(metric.date).toLocaleDateString('it-IT')}
                            </Typography>
                          }
                          secondary={
                            <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
                              {metric.weight && (
                                <Typography variant="body2" color="text.secondary">
                                  Peso: {metric.weight}kg
                                </Typography>
                              )}
                              {metric.body_fat_percent && (
                                <Typography variant="body2" color="text.secondary">
                                  BF: {metric.body_fat_percent}%
                                </Typography>
                              )}
                              {metric.resting_hr && (
                                <Typography variant="body2" color="text.secondary">
                                  FC: {metric.resting_hr}bpm
                                </Typography>
                              )}
                              {metric.vo2_max && (
                                <Typography variant="body2" color="text.secondary">
                                  VO2: {metric.vo2_max}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {metric.notes && (
                        <Box px={2} pb={2}>
                          <Typography variant="body2" color="text.secondary">
                            {metric.notes}
                          </Typography>
                        </Box>
                      )}
                      {index < metrics.slice(0, 5).length - 1 && (
                        <Divider sx={{ bgcolor: 'rgba(0,0,0,0.1)' }} />
                      )}
                    </Box>
                  ))}
                </List>
              )}
            </Box>
          )}

          {activeTab === 'measurements' && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" color="text.primary">
                  Circonferenze
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PlusIcon />}
                  onClick={() => setShowMeasurementsForm(true)}
                  sx={{
                    backgroundColor: colors.primary.main,
                    color: 'black',
                    '&:hover': {
                      backgroundColor: colors.primary.dark
                    }
                  }}
                >
                  Aggiungi
                </Button>
              </Box>

              {measurements.length === 0 ? (
                <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                  Nessuna misurazione registrata. Inizia a tracciare le tue circonferenze!
                </Typography>
              ) : (
                <List>
                  {measurements.slice(0, 5).map((measurement, index) => {
                    const labels = {
                      bicep_cm: 'Bicipite',
                      chest_cm: 'Petto',
                      waist_cm: 'Vita',
                      hips_cm: 'Fianchi',
                      thigh_cm: 'Coscia',
                      neck_cm: 'Collo',
                      forearm_cm: 'Avambraccio',
                      calf_cm: 'Polpaccio'
                    }
                    
                    return (
                      <Box key={measurement.id}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" color="text.primary">
                                {new Date(measurement.date).toLocaleDateString('it-IT')}
                              </Typography>
                            }
                            secondary={
                              <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
                                {Object.entries(measurement).map(([key, value]) => {
                                  if (!value || ['id', 'user_id', 'date', 'created_at', 'notes'].includes(key)) return null
                                  
                                  return (
                                    <Typography key={key} variant="body2" color="text.secondary">
                                      {labels[key]}: {value}cm
                                    </Typography>
                                  )
                                })}
                              </Box>
                            }
                          />
                        </ListItem>
                        {measurement.notes && (
                          <Box px={2} pb={2}>
                            <Typography variant="body2" color="text.secondary">
                              {measurement.notes}
                            </Typography>
                          </Box>
                        )}
                        {index < measurements.slice(0, 5).length - 1 && (
                          <Divider sx={{ bgcolor: 'rgba(0,0,0,0.1)' }} />
                        )}
                      </Box>
                    )
                  })}
                </List>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Metrics Form Modal */}
      <Dialog 
        open={showMetricsForm} 
        onClose={() => setShowMetricsForm(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: colors.background.card,
            backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="text.primary">
            Aggiungi Metriche
          </Typography>
          <IconButton onClick={() => setShowMetricsForm(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleMetricsSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Peso (kg)</FormLabel>
                  <TextField
                    type="number"
                    inputProps={{ step: 0.1 }}
                    value={metricsForm.weight}
                    onChange={(e) => setMetricsForm({...metricsForm, weight: e.target.value})}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Body Fat (%)</FormLabel>
                  <TextField
                    type="number"
                    inputProps={{ step: 0.1, min: 0, max: 50 }}
                    value={metricsForm.body_fat_percent}
                    onChange={(e) => setMetricsForm({...metricsForm, body_fat_percent: e.target.value})}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Massa Muscolare (kg)</FormLabel>
                  <TextField
                    type="number"
                    inputProps={{ step: 0.1 }}
                    value={metricsForm.muscle_mass_kg}
                    onChange={(e) => setMetricsForm({...metricsForm, muscle_mass_kg: e.target.value})}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <FormLabel sx={{ mb: 1, color: colors.text.primary }}>FC Riposo (bpm)</FormLabel>
                  <TextField
                    type="number"
                    inputProps={{ min: 30, max: 120 }}
                    value={metricsForm.resting_hr}
                    onChange={(e) => setMetricsForm({...metricsForm, resting_hr: e.target.value})}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Pressione Sistolica</FormLabel>
                  <TextField
                    type="number"
                    inputProps={{ min: 80, max: 200 }}
                    value={metricsForm.blood_pressure_sys}
                    onChange={(e) => setMetricsForm({...metricsForm, blood_pressure_sys: e.target.value})}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Pressione Diastolica</FormLabel>
                  <TextField
                    type="number"
                    inputProps={{ min: 40, max: 120 }}
                    value={metricsForm.blood_pressure_dia}
                    onChange={(e) => setMetricsForm({...metricsForm, blood_pressure_dia: e.target.value})}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <FormLabel sx={{ mb: 1, color: colors.text.primary }}>VO2 Max</FormLabel>
                  <TextField
                    type="number"
                    inputProps={{ step: 0.1, min: 20, max: 80 }}
                    value={metricsForm.vo2_max}
                    onChange={(e) => setMetricsForm({...metricsForm, vo2_max: e.target.value})}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Data</FormLabel>
                  <TextField
                    type="date"
                    value={metricsForm.date}
                    onChange={(e) => setMetricsForm({...metricsForm, date: e.target.value})}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Note</FormLabel>
                  <TextField
                    multiline
                    rows={4}
                    value={metricsForm.notes}
                    onChange={(e) => setMetricsForm({...metricsForm, notes: e.target.value})}
                    placeholder="Note opzionali..."
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setShowMetricsForm(false)}
            variant="outlined"
            sx={{
              borderColor: colors.text.secondary,
              color: colors.text.primary,
              '&:hover': {
                borderColor: colors.text.primary,
                backgroundColor: 'rgba(0, 0, 0, 0.05)'
              }
            }}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleMetricsSubmit}
            variant="contained"
            sx={{
              backgroundColor: colors.primary.main,
              color: 'black',
              '&:hover': {
                backgroundColor: colors.primary.dark
              }
            }}
          >
            Salva
          </Button>
        </DialogActions>
      </Dialog>

      {/* Measurements Form Modal */}
      <Dialog 
        open={showMeasurementsForm} 
        onClose={() => setShowMeasurementsForm(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: colors.background.card,
            backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="text.primary">
            Aggiungi Circonferenze
          </Typography>
          <IconButton onClick={() => setShowMeasurementsForm(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleMeasurementsSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Bicipite (cm)</FormLabel>
                  <TextField
                    type="number"
                    inputProps={{ step: 0.1 }}
                    value={measurementsForm.bicep_cm}
                    onChange={(e) => setMeasurementsForm({...measurementsForm, bicep_cm: e.target.value})}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Petto (cm)</FormLabel>
                  <TextField
                    type="number"
                    inputProps={{ step: 0.1 }}
                    value={measurementsForm.chest_cm}
                    onChange={(e) => setMeasurementsForm({...measurementsForm, chest_cm: e.target.value})}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Vita (cm)</FormLabel>
                  <TextField
                    type="number"
                    inputProps={{ step: 0.1 }}
                    value={measurementsForm.waist_cm}
                    onChange={(e) => setMeasurementsForm({...measurementsForm, waist_cm: e.target.value})}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Fianchi (cm)</FormLabel>
                  <TextField
                    type="number"
                    inputProps={{ step: 0.1 }}
                    value={measurementsForm.hips_cm}
                    onChange={(e) => setMeasurementsForm({...measurementsForm, hips_cm: e.target.value})}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Coscia (cm)</FormLabel>
                  <TextField
                    type="number"
                    inputProps={{ step: 0.1 }}
                    value={measurementsForm.thigh_cm}
                    onChange={(e) => setMeasurementsForm({...measurementsForm, thigh_cm: e.target.value})}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Collo (cm)</FormLabel>
                  <TextField
                    type="number"
                    inputProps={{ step: 0.1 }}
                    value={measurementsForm.neck_cm}
                    onChange={(e) => setMeasurementsForm({...measurementsForm, neck_cm: e.target.value})}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Avambraccio (cm)</FormLabel>
                  <TextField
                    type="number"
                    inputProps={{ step: 0.1 }}
                    value={measurementsForm.forearm_cm}
                    onChange={(e) => setMeasurementsForm({...measurementsForm, forearm_cm: e.target.value})}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Polpaccio (cm)</FormLabel>
                  <TextField
                    type="number"
                    inputProps={{ step: 0.1 }}
                    value={measurementsForm.calf_cm}
                    onChange={(e) => setMeasurementsForm({...measurementsForm, calf_cm: e.target.value})}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Data</FormLabel>
                  <TextField
                    type="date"
                    value={measurementsForm.date}
                    onChange={(e) => setMeasurementsForm({...measurementsForm, date: e.target.value})}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Note</FormLabel>
                  <TextField
                    multiline
                    rows={4}
                    value={measurementsForm.notes}
                    onChange={(e) => setMeasurementsForm({...measurementsForm, notes: e.target.value})}
                    placeholder="Note opzionali..."
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setShowMeasurementsForm(false)}
            variant="outlined"
            sx={{
              borderColor: colors.text.secondary,
              color: colors.text.primary,
              '&:hover': {
                borderColor: colors.text.primary,
                backgroundColor: 'rgba(0, 0, 0, 0.05)'
              }
            }}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleMeasurementsSubmit}
            variant="contained"
            sx={{
              backgroundColor: colors.primary.main,
              color: 'black',
              '&:hover': {
                backgroundColor: colors.primary.dark
              }
            }}
          >
            Salva
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BodyMetrics

