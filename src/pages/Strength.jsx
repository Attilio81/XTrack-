
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip
} from '@mui/material'
import { 
  FitnessCenter as DumbbellIcon, 
  Add as PlusIcon, 
  Close as CloseIcon, 
  TrendingUp as TrendingUpIcon, 
  EmojiEvents as TrophyIcon,
  CalendarToday as CalendarIcon, 
  TrackChanges as TargetIcon, 
  BarChart as BarChart3Icon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { colors, commonStyles } from '../theme'
import MetricCard from '../components/MetricCard'
import ProgressRing from '../components/ProgressRing'

const Strength = () => {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [selectedExercise, setSelectedExercise] = useState('')
  const [showCompletedOnly, setShowCompletedOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [strengthForm, setStrengthForm] = useState({
    exercise: '',
    weight: '',
    reps: 1,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const exercises = [
    'Back Squat', 'Front Squat', 'Overhead Squat',
    'Deadlift', 'Sumo Deadlift',
    'Bench Press', 'Overhead Press', 'Push Press', 'Push Jerk',
    'Clean', 'Power Clean', 'Hang Clean',
    'Jerk', 'Split Jerk',
    'Clean & Jerk', 'Snatch', 'Power Snatch',
    'Bent Over Row', 'Pull-ups', 'Strict Pull-ups'
  ]

  useEffect(() => {
    loadStrengthRecords()
  }, [])

  useEffect(() => {
    if (editingRecord) {
      setStrengthForm({
        exercise: editingRecord.exercise,
        weight: editingRecord.weight.toString(),
        reps: editingRecord.reps,
        date: editingRecord.date,
        notes: editingRecord.notes || ''
      })
    }
  }, [editingRecord])

  const loadStrengthRecords = async () => {
    try {
      const { data } = await supabase
        .from('strength_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      setRecords(data || [])
    } catch (error) {
      console.error('Error loading strength records:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('strength_records')
        .insert({
          user_id: user.id,
          exercise: strengthForm.exercise,
          weight: parseFloat(strengthForm.weight),
          reps: parseInt(strengthForm.reps),
          date: strengthForm.date,
          notes: strengthForm.notes
        })

      if (error) throw error

      await loadStrengthRecords()
      setShowForm(false)
      setStrengthForm({
        exercise: '',
        weight: '',
        reps: 1,
        date: new Date().toISOString().split('T')[0],
        notes: ''
      })
    } catch (error) {
      console.error('Error adding strength record:', error)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('strength_records')
        .update({
          exercise: strengthForm.exercise,
          weight: parseFloat(strengthForm.weight),
          reps: parseInt(strengthForm.reps),
          date: strengthForm.date,
          notes: strengthForm.notes
        })
        .eq('id', editingRecord.id)

      if (error) throw error

      await loadStrengthRecords()
      setShowEditForm(false)
      setEditingRecord(null)
      setStrengthForm({
        exercise: '',
        weight: '',
        reps: 1,
        date: new Date().toISOString().split('T')[0],
        notes: ''
      })
    } catch (error) {
      console.error('Error editing strength record:', error)
    }
  }

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo record?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('strength_records')
        .delete()
        .eq('id', recordId)

      if (error) throw error

      await loadStrengthRecords()
    } catch (error) {
      console.error('Error deleting strength record:', error)
    }
  }

  const getExerciseData = (exercise) => {
    const exerciseRecords = records
      .filter(r => r.exercise === exercise)
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    const currentPR = exerciseRecords.reduce((max, record) => 
      record.estimated_1rm > (max?.estimated_1rm || 0) ? record : max
    , null)

    return {
      records: exerciseRecords,
      currentPR,
      totalSessions: exerciseRecords.length,
      progressData: exerciseRecords.map((record, index) => ({
        session: index + 1,
        weight: record.estimated_1rm,
        date: record.date
      }))
    }
  }

  const getMainExercises = () => {
    const mainLifts = ['Back Squat', 'Deadlift', 'Bench Press', 'Overhead Press']
    return mainLifts.map(exercise => ({
      exercise,
      ...getExerciseData(exercise)
    })).filter(data => data.records.length > 0)
  }

  const getAllExercises = () => {
    const uniqueExercises = [...new Set(records.map(r => r.exercise))]
    let allExercises = uniqueExercises.map(exercise => ({
      exercise,
      ...getExerciseData(exercise)
    }))

    // Filter for completed exercises only (exercises with records)
    if (showCompletedOnly) {
      allExercises = allExercises.filter(exercise => exercise.records.length > 0)
    }

    return allExercises
  }

  const mainExercises = getMainExercises()
  const allExercises = getAllExercises()

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ color: colors.primary.main }} />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent={{ md: 'space-between' }} gap={2} mb={3}>
        <Box>
          <Typography variant="h4" sx={{ color: colors.text.primary, fontWeight: 'bold', mb: 1 }}>
            Strength
          </Typography>
          <Typography variant="body1" sx={{ color: colors.text.secondary }}>
            Traccia i tuoi massimali e progressi di forza
          </Typography>
        </Box>
        <Button
          onClick={() => setShowForm(true)}
          variant="contained"
          startIcon={<PlusIcon />}
          sx={{
            backgroundColor: colors.primary.main,
            '&:hover': { backgroundColor: colors.primary.dark },
            px: 3,
            py: 1.5,
            borderRadius: 2
          }}
        >
          Aggiungi Record
        </Button>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard
            title="Esercizi"
            value={[...new Set(records.map(r => r.exercise))].length}
            icon={DumbbellIcon}
            gradient="primary"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard
            title="Records Totali"
            value={records.length}
            icon={TrophyIcon}
            gradient="secondary"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard
            title="Alzate Principali"
            value={mainExercises.length}
            icon={BarChart3Icon}
            gradient="success"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard
            title="Completati"
            value={[...new Set(records.map(r => r.exercise))].length}
            icon={TargetIcon}
            gradient={showCompletedOnly ? "primary" : "warning"}
            onClick={() => setShowCompletedOnly(!showCompletedOnly)}
            subtitle={showCompletedOnly ? "Filtro attivo" : "Clicca per filtrare"}
          />
        </Grid>
      </Grid>

      {/* Active Filters Indicator */}
      {showCompletedOnly && (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Filtri attivi:
          </Typography>
          <Chip
            label="Solo Completati"
            size="small"
            onDelete={() => setShowCompletedOnly(false)}
            sx={{
              backgroundColor: colors.primary.main,
              color: 'black',
              '& .MuiChip-deleteIcon': {
                color: 'black'
              }
            }}
          />
          <Button
            size="small"
            onClick={() => setShowCompletedOnly(false)}
            sx={{
              color: colors.text.secondary,
              fontSize: '0.75rem',
              textTransform: 'none'
            }}
          >
            Cancella filtri
          </Button>
        </Box>
      )}

      {/* Main Lifts Progress */}
      {mainExercises.length > 0 && (
        <Card sx={{ ...commonStyles.glassCard, mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={3}>
              <BarChart3Icon sx={{ color: colors.primary.main, mr: 1 }} />
              <Typography variant="h6" sx={{ color: colors.text.primary, fontWeight: 'semibold' }}>
                Alzate Principali
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {mainExercises.map(({ exercise, currentPR }) => (
                <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={exercise}>
                  <MetricCard
                    title={exercise}
                    value={currentPR ? `${currentPR.estimated_1rm}kg` : 'N/A'}
                    subtitle={currentPR && `${currentPR.weight}kg x ${currentPR.reps}`}
                    icon={DumbbellIcon}
                    gradient="primary"
                    onClick={() => setSelectedExercise(exercise)}
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Progress Chart */}
      {selectedExercise && (
        <Card sx={{ ...commonStyles.glassCard, mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: colors.text.primary, mb: 3 }}>
              Progressione - {selectedExercise}
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getExerciseData(selectedExercise).progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.text.secondary} opacity={0.3} />
                  <XAxis dataKey="session" stroke={colors.text.secondary} />
                  <YAxis stroke={colors.text.secondary} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: colors.background.paper, 
                      border: `1px solid ${colors.text.secondary}`,
                      borderRadius: '8px',
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

      {/* All Exercises */}
      <Card sx={{ ...commonStyles.glassCard, mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <DumbbellIcon sx={{ color: colors.primary.main, mr: 1 }} />
            <Typography variant="h6" sx={{ color: colors.text.primary, fontWeight: 'semibold' }}>
              Tutti gli Esercizi
            </Typography>
          </Box>
          
          {allExercises.length === 0 ? (
            <Box textAlign="center" py={4}>
              <DumbbellIcon sx={{ fontSize: 48, color: colors.text.secondary, mb: 2 }} />
              <Typography variant="body1" sx={{ color: colors.text.secondary, mb: 2 }}>
                {showCompletedOnly 
                  ? 'Nessun esercizio completato' 
                  : 'Nessun record di forza registrato'
                }
              </Typography>
              <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 2 }}>
                {showCompletedOnly 
                  ? 'Aggiungi il tuo primo record per vedere gli esercizi qui!'
                  : 'Aggiungi il tuo primo record per iniziare.'
                }
              </Typography>
              {showCompletedOnly ? (
                <Button
                  variant="outlined"
                  onClick={() => setShowCompletedOnly(false)}
                  sx={{
                    borderColor: colors.primary.main,
                    color: colors.primary.main,
                    '&:hover': {
                      backgroundColor: `${colors.primary.main}10`,
                      borderColor: colors.primary.main
                    }
                  }}
                >
                  Mostra tutti gli esercizi
                </Button>
              ) : (
                <Button
                  onClick={() => setShowForm(true)}
                  variant="contained"
                  sx={{
                    backgroundColor: colors.primary.main,
                    '&:hover': { backgroundColor: colors.primary.dark }
                  }}
                >
                  Aggiungi il tuo primo record
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={2}>
              {allExercises.map(({ exercise, currentPR, totalSessions }) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={exercise}>
                  <Card 
                    sx={{ 
                      ...commonStyles.glassCard, 
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => setSelectedExercise(selectedExercise === exercise ? '' : exercise)}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Typography variant="subtitle1" sx={{ color: colors.text.primary, fontWeight: 'medium' }}>
                          {exercise}
                        </Typography>
                        {currentPR?.is_pr && <TrophyIcon sx={{ color: '#fbbf24', fontSize: 16 }} />}
                      </Box>
                      
                      {currentPR ? (
                        <>
                          <Typography variant="h5" sx={{ color: colors.primary.main, fontWeight: 'bold', mb: 0.5 }}>
                            {currentPR.estimated_1rm}kg
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 1 }}>
                            1RM stimato da {currentPR.weight}kg × {currentPR.reps}
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box display="flex" alignItems="center">
                              <CalendarIcon sx={{ fontSize: 12, color: colors.text.secondary, mr: 0.5 }} />
                              <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                                {new Date(currentPR.date).toLocaleDateString('it-IT')}
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                              {totalSessions} sessioni
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                          Nessun record
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Recent Records */}
      <Card sx={{ ...commonStyles.glassCard, mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <CalendarIcon sx={{ color: colors.primary.main, mr: 1 }} />
            <Typography variant="h6" sx={{ color: colors.text.primary, fontWeight: 'semibold' }}>
              Records Recenti
            </Typography>
          </Box>
          
          {records.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" sx={{ color: colors.text.secondary, mb: 2 }}>
                Nessun record registrato
              </Typography>
            </Box>
          ) : (
            <Box>
              {records.slice(0, 10).map((record) => (
                <Box
                  key={record.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    mb: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 1,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 215, 0, 0.05)',
                      borderColor: 'rgba(255, 215, 0, 0.2)'
                    }
                  }}
                >
                  <Box flex={1}>
                    <Typography variant="subtitle1" sx={{ color: colors.text.primary, fontWeight: 'medium' }}>
                      {record.exercise}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.primary.main, fontWeight: 'bold' }}>
                      {record.weight}kg × {record.reps} (1RM: {record.estimated_1rm}kg)
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                      {new Date(record.date).toLocaleDateString('it-IT')}
                      {record.notes && ` • ${record.notes}`}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={0.5}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingRecord(record)
                        setShowEditForm(true)
                      }}
                      sx={{ 
                        color: colors.primary.main,
                        '&:hover': { backgroundColor: `${colors.primary.main}20` }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteRecord(record.id)}
                      sx={{ 
                        color: colors.error?.main || '#f44336',
                        '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add Record Modal */}
      <Dialog 
        open={showForm} 
        onClose={() => setShowForm(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            ...commonStyles.glassCard,
            m: 2
          }
        }}
      >
        <DialogTitle sx={{ color: colors.text.primary, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Aggiungi Record
          <IconButton onClick={() => setShowForm(false)} sx={{ color: colors.text.secondary }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ color: colors.text.secondary }}>Esercizio</InputLabel>
              <Select
                value={strengthForm.exercise}
                onChange={(e) => setStrengthForm({...strengthForm, exercise: e.target.value})}
                required
                sx={{
                  color: colors.text.primary,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.text.secondary
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary.main
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary.main
                  }
                }}
              >
                {exercises.map(exercise => (
                  <MenuItem key={exercise} value={exercise}>
                    {exercise}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Peso (kg)"
                  type="number"
                  inputProps={{ step: "0.5" }}
                  value={strengthForm.weight}
                  onChange={(e) => setStrengthForm({...strengthForm, weight: e.target.value})}
                  required
                  sx={{
                    '& .MuiInputLabel-root': { color: colors.text.secondary },
                    '& .MuiOutlinedInput-root': {
                      color: colors.text.primary,
                      '& fieldset': { borderColor: colors.text.secondary },
                      '&:hover fieldset': { borderColor: colors.primary.main },
                      '&.Mui-focused fieldset': { borderColor: colors.primary.main }
                    }
                  }}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Ripetizioni"
                  type="number"
                  inputProps={{ min: "1", max: "20" }}
                  value={strengthForm.reps}
                  onChange={(e) => setStrengthForm({...strengthForm, reps: e.target.value})}
                  required
                  sx={{
                    '& .MuiInputLabel-root': { color: colors.text.secondary },
                    '& .MuiOutlinedInput-root': {
                      color: colors.text.primary,
                      '& fieldset': { borderColor: colors.text.secondary },
                      '&:hover fieldset': { borderColor: colors.primary.main },
                      '&.Mui-focused fieldset': { borderColor: colors.primary.main }
                    }
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Data"
              type="date"
              value={strengthForm.date}
              onChange={(e) => setStrengthForm({...strengthForm, date: e.target.value})}
              sx={{
                mb: 2,
                '& .MuiInputLabel-root': { color: colors.text.secondary },
                '& .MuiOutlinedInput-root': {
                  color: colors.text.primary,
                  '& fieldset': { borderColor: colors.text.secondary },
                  '&:hover fieldset': { borderColor: colors.primary.main },
                  '&.Mui-focused fieldset': { borderColor: colors.primary.main }
                }
              }}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Note"
              multiline
              rows={3}
              value={strengthForm.notes}
              onChange={(e) => setStrengthForm({...strengthForm, notes: e.target.value})}
              placeholder="Note opzionali..."
              sx={{
                mb: 3,
                '& .MuiInputLabel-root': { color: colors.text.secondary },
                '& .MuiOutlinedInput-root': {
                  color: colors.text.primary,
                  '& fieldset': { borderColor: colors.text.secondary },
                  '&:hover fieldset': { borderColor: colors.primary.main },
                  '&.Mui-focused fieldset': { borderColor: colors.primary.main }
                }
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setShowForm(false)}
            sx={{ color: colors.text.secondary }}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            sx={{
              backgroundColor: colors.primary.main,
              '&:hover': { backgroundColor: colors.primary.dark }
            }}
          >
            Salva
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Record Modal */}
      <Dialog 
        open={showEditForm} 
        onClose={() => setShowEditForm(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            ...commonStyles.glassCard,
            m: 2
          }
        }}
      >
        <DialogTitle sx={{ color: colors.text.primary, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Modifica Record
          <IconButton onClick={() => setShowEditForm(false)} sx={{ color: colors.text.secondary }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box component="form" onSubmit={handleEditSubmit} sx={{ pt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ color: colors.text.secondary }}>Esercizio</InputLabel>
              <Select
                value={strengthForm.exercise}
                onChange={(e) => setStrengthForm({...strengthForm, exercise: e.target.value})}
                required
                sx={{
                  color: colors.text.primary,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.text.secondary
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary.main
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary.main
                  }
                }}
              >
                {exercises.map(exercise => (
                  <MenuItem key={exercise} value={exercise}>
                    {exercise}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Peso (kg)"
                  type="number"
                  inputProps={{ step: "0.5" }}
                  value={strengthForm.weight}
                  onChange={(e) => setStrengthForm({...strengthForm, weight: e.target.value})}
                  required
                  sx={{
                    '& .MuiInputLabel-root': { color: colors.text.secondary },
                    '& .MuiOutlinedInput-root': {
                      color: colors.text.primary,
                      '& fieldset': { borderColor: colors.text.secondary },
                      '&:hover fieldset': { borderColor: colors.primary.main },
                      '&.Mui-focused fieldset': { borderColor: colors.primary.main }
                    }
                  }}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Ripetizioni"
                  type="number"
                  inputProps={{ min: "1", max: "20" }}
                  value={strengthForm.reps}
                  onChange={(e) => setStrengthForm({...strengthForm, reps: e.target.value})}
                  required
                  sx={{
                    '& .MuiInputLabel-root': { color: colors.text.secondary },
                    '& .MuiOutlinedInput-root': {
                      color: colors.text.primary,
                      '& fieldset': { borderColor: colors.text.secondary },
                      '&:hover fieldset': { borderColor: colors.primary.main },
                      '&.Mui-focused fieldset': { borderColor: colors.primary.main }
                    }
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Data"
              type="date"
              value={strengthForm.date}
              onChange={(e) => setStrengthForm({...strengthForm, date: e.target.value})}
              sx={{
                mb: 2,
                '& .MuiInputLabel-root': { color: colors.text.secondary },
                '& .MuiOutlinedInput-root': {
                  color: colors.text.primary,
                  '& fieldset': { borderColor: colors.text.secondary },
                  '&:hover fieldset': { borderColor: colors.primary.main },
                  '&.Mui-focused fieldset': { borderColor: colors.primary.main }
                }
              }}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Note"
              multiline
              rows={3}
              value={strengthForm.notes}
              onChange={(e) => setStrengthForm({...strengthForm, notes: e.target.value})}
              placeholder="Note opzionali..."
              sx={{
                mb: 3,
                '& .MuiInputLabel-root': { color: colors.text.secondary },
                '& .MuiOutlinedInput-root': {
                  color: colors.text.primary,
                  '& fieldset': { borderColor: colors.text.secondary },
                  '&:hover fieldset': { borderColor: colors.primary.main },
                  '&.Mui-focused fieldset': { borderColor: colors.primary.main }
                }
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setShowEditForm(false)}
            sx={{ color: colors.text.secondary }}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleEditSubmit}
            variant="contained"
            sx={{
              backgroundColor: colors.primary.main,
              '&:hover': { backgroundColor: colors.primary.dark }
            }}
          >
            Salva Modifiche
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Strength