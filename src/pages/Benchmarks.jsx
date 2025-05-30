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
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormLabel,
  InputLabel,
  OutlinedInput
} from '@mui/material'
import { 
  EmojiEvents as TrophyIcon, 
  FitnessCenter as DumbbellIcon,
  Insights as TrendingUpIcon,
  FilterAlt as FilterIcon,
  Add as PlusIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  AccessTime as ClockIcon,
  MilitaryTech as MedalIcon,
  FlashOn as ZapIcon,
  TrackChanges as TargetIcon
} from '@mui/icons-material'
import { colors, commonStyles } from '../theme'
import MetricCard from '../components/MetricCard'
import ProgressRing from '../components/ProgressRing'

const Benchmarks = () => {
  const { user } = useAuth()
  const [benchmarks, setBenchmarks] = useState([])
  const [results, setResults] = useState([])
  const [filteredBenchmarks, setFilteredBenchmarks] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCompletedOnly, setShowCompletedOnly] = useState(false)
  const [showResultForm, setShowResultForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingResult, setEditingResult] = useState(null)
  const [selectedBenchmark, setSelectedBenchmark] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [resultForm, setResultForm] = useState({
    result: '',
    scale: 'RX',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadBenchmarksAndResults()
  }, [])

  useEffect(() => {
    filterBenchmarks()
  }, [benchmarks, selectedCategory, searchTerm, showCompletedOnly, results])

  useEffect(() => {
    if (editingResult) {
      setResultForm({
        result: editingResult.result,
        scale: editingResult.scale,
        notes: editingResult.notes || '',
        date: editingResult.date
      })
    }
  }, [editingResult])

  const loadBenchmarksAndResults = async () => {
    try {
      // Load all benchmarks
      const { data: benchmarksData } = await supabase
        .from('benchmarks')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      // Load user results
      const { data: resultsData } = await supabase
        .from('benchmark_results')
        .select(`
          *,
          benchmarks (name, category, type)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      setBenchmarks(benchmarksData || [])
      setResults(resultsData || [])
    } catch (error) {
      console.error('Error loading benchmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterBenchmarks = () => {
    let filtered = benchmarks

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(b => b.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter for completed benchmarks only
    if (showCompletedOnly) {
      const completedBenchmarkIds = [...new Set(results.map(r => r.benchmark_id))]
      filtered = filtered.filter(b => completedBenchmarkIds.includes(b.id))
    }

    setFilteredBenchmarks(filtered)
  }

  const handleAddResult = async (e) => {
    e.preventDefault()
    try {
      // Convert time to seconds for comparison
      let resultSeconds = null
      let resultNumeric = null

      if (selectedBenchmark.type === 'Time') {
        // Parse time format (mm:ss or h:mm:ss)
        const timeParts = resultForm.result.split(':').map(Number)
        if (timeParts.length === 2) {
          resultSeconds = timeParts[0] * 60 + timeParts[1]
        } else if (timeParts.length === 3) {
          resultSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2]
        }
      } else {
        // For rounds, reps, load - extract numeric value
        const numMatch = resultForm.result.match(/(\d+(?:\.\d+)?)/)
        if (numMatch) {
          resultNumeric = parseFloat(numMatch[1])
        }
      }

      const { error } = await supabase
        .from('benchmark_results')
        .insert({
          user_id: user.id,
          benchmark_id: selectedBenchmark.id,
          result: resultForm.result,
          result_seconds: resultSeconds,
          result_numeric: resultNumeric,
          scale: resultForm.scale,
          notes: resultForm.notes,
          date: resultForm.date
        })

      if (error) throw error

      await loadBenchmarksAndResults()
      setShowResultForm(false)
      setResultForm({
        result: '',
        scale: 'RX',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('Error adding result:', error)
    }
  }

  const handleEditResult = async (e) => {
    e.preventDefault()
    try {
      // Convert time to seconds for comparison
      let resultSeconds = null
      let resultNumeric = null

      if (selectedBenchmark.type === 'Time') {
        // Parse time format (mm:ss or h:mm:ss)
        const timeParts = resultForm.result.split(':').map(Number)
        if (timeParts.length === 2) {
          resultSeconds = timeParts[0] * 60 + timeParts[1]
        } else if (timeParts.length === 3) {
          resultSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2]
        }
      } else {
        // For rounds, reps, load - extract numeric value
        const numMatch = resultForm.result.match(/(\d+(?:\.\d+)?)/)
        if (numMatch) {
          resultNumeric = parseFloat(numMatch[1])
        }
      }

      const { error } = await supabase
        .from('benchmark_results')
        .update({
          result: resultForm.result,
          result_seconds: resultSeconds,
          result_numeric: resultNumeric,
          scale: resultForm.scale,
          notes: resultForm.notes,
          date: resultForm.date
        })
        .eq('id', editingResult.id)

      if (error) throw error

      await loadBenchmarksAndResults()
      setShowEditForm(false)
      setEditingResult(null)
      setResultForm({
        result: '',
        scale: 'RX',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('Error editing result:', error)
    }
  }

  const handleDeleteResult = async (resultId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo risultato?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('benchmark_results')
        .delete()
        .eq('id', resultId)

      if (error) throw error

      await loadBenchmarksAndResults()
    } catch (error) {
      console.error('Error deleting result:', error)
    }
  }

  const getBenchmarkPR = (benchmarkId) => {
    const benchmarkResults = results.filter(r => r.benchmark_id === benchmarkId)
    return benchmarkResults.find(r => r.is_pr)
  }

  const getBenchmarkIcon = (category) => {
    switch (category) {
      case 'Girls': return <ZapIcon sx={{ color: colors.primary.main }} />
      case 'Heroes': return <MedalIcon sx={{ color: colors.primary.main }} />
      case 'Strength': return <TrophyIcon sx={{ color: colors.primary.main }} />
      default: return <TargetIcon sx={{ color: colors.primary.main }} />
    }
  }

  const categories = ['all', ...new Set(benchmarks.map(b => b.category))]

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
          Benchmarks
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Traccia i tuoi WODs CrossFit
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard
            title="Totale WODs"
            value={benchmarks.length}
            icon={TargetIcon}
            gradient="primary"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard
            title="PR Totali"
            value={results.filter(r => r.is_pr).length}
            icon={TrophyIcon}
            gradient="secondary"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard
            title="Categorie"
            value={categories.length - 1} 
            icon={DumbbellIcon}
            gradient="success"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard
            title="Completati"
            value={results.length}
            icon={ClockIcon}
            gradient={showCompletedOnly ? "primary" : "warning"}
            onClick={() => {
              setShowCompletedOnly(!showCompletedOnly)
              setSelectedCategory('all') // Reset category filter when filtering by completed
            }}
            subtitle={showCompletedOnly ? "Filtro attivo" : "Clicca per filtrare"}
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ ...commonStyles.glassCard, mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            {/* Search */}
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                placeholder="Cerca benchmark..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: colors.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '&:hover fieldset': {
                      borderColor: colors.primary.main,
                    },
                  }
                }}
              />
            </Grid>

            {/* Category Filter */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  displayEmpty
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon sx={{ color: colors.text.secondary }} />
                    </InputAdornment>
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                    }
                  }}
                >
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>
                      {cat === 'all' ? 'Tutte le categorie' : cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Active Filters Indicator */}
      {(showCompletedOnly || selectedCategory !== 'all' || searchTerm) && (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Filtri attivi:
          </Typography>
          {showCompletedOnly && (
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
          )}
          {selectedCategory !== 'all' && (
            <Chip
              label={`Categoria: ${selectedCategory}`}
              size="small"
              onDelete={() => setSelectedCategory('all')}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                color: colors.text.primary
              }}
            />
          )}
          {searchTerm && (
            <Chip
              label={`Ricerca: "${searchTerm}"`}
              size="small"
              onDelete={() => setSearchTerm('')}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                color: colors.text.primary
              }}
            />
          )}
          <Button
            size="small"
            onClick={() => {
              setShowCompletedOnly(false)
              setSelectedCategory('all')
              setSearchTerm('')
            }}
            sx={{
              color: colors.text.secondary,
              fontSize: '0.75rem',
              textTransform: 'none'
            }}
          >
            Cancella tutti
          </Button>
        </Box>
      )}

      {/* Benchmarks Grid */}
      <Grid container spacing={3}>
        {filteredBenchmarks.length === 0 ? (
          <Grid size={12}>
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 8,
                ...commonStyles.glassCard,
                borderRadius: 2
              }}
            >
              <TargetIcon sx={{ fontSize: 64, color: colors.text.secondary, mb: 2 }} />
              <Typography variant="h6" color="text.primary" gutterBottom>
                {showCompletedOnly 
                  ? 'Nessun benchmark completato' 
                  : 'Nessun benchmark trovato'
                }
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {showCompletedOnly 
                  ? 'Completa il tuo primo benchmark per vederlo qui!'
                  : 'Prova a modificare i filtri per trovare altri benchmark.'
                }
              </Typography>
              {(showCompletedOnly || selectedCategory !== 'all' || searchTerm) && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowCompletedOnly(false)
                    setSelectedCategory('all')
                    setSearchTerm('')
                  }}
                  sx={{
                    borderColor: colors.primary.main,
                    color: colors.primary.main,
                    '&:hover': {
                      backgroundColor: `${colors.primary.main}10`,
                      borderColor: colors.primary.main
                    }
                  }}
                >
                  Mostra tutti i benchmark
                </Button>
              )}
            </Box>
          </Grid>
        ) : (
          filteredBenchmarks.map((benchmark) => {
          const pr = getBenchmarkPR(benchmark.id)
          const userResults = results.filter(r => r.benchmark_id === benchmark.id)
          
          return (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={benchmark.id}>
              <Card sx={{ 
                ...commonStyles.glassCard, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  borderColor: colors.primary.main,
                }
              }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                      <Box mr={1}>{getBenchmarkIcon(benchmark.category)}</Box>
                      <Typography variant="h6" color="text.primary">
                        {benchmark.name}
                      </Typography>
                    </Box>
                    <Chip 
                      label={benchmark.category} 
                      size="small"
                      sx={{ 
                        backgroundColor: `${colors.primary.main}20`,
                        color: colors.text.primary,
                        fontWeight: 500
                      }} 
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" mb={2} sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {benchmark.description}
                  </Typography>

                  {/* Movements */}
                  {benchmark.movements && (
                    <Box mb={2}>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {(typeof benchmark.movements === 'string' 
                          ? benchmark.movements.split(',') 
                          : Array.isArray(benchmark.movements) 
                            ? benchmark.movements 
                            : []
                        ).map((movement, idx) => (
                          <Chip 
                            key={idx} 
                            label={typeof movement === 'string' ? movement.trim() : movement} 
                            size="small" 
                            sx={{ 
                              backgroundColor: 'rgba(0, 0, 0, 0.05)',
                              color: colors.text.secondary 
                            }} 
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* PR Display */}
                  {pr && (
                    <Box mb={2} p={1.5} sx={{ 
                      backgroundColor: `${colors.primary.main}10`,
                      border: `1px solid ${colors.primary.main}30`,
                      borderRadius: 1
                    }}>
                      <Box display="flex" alignItems="center" mb={0.5}>
                        <TrophyIcon sx={{ color: colors.primary.main, fontSize: 18, mr: 0.5 }} />
                        <Typography variant="body2" fontWeight={500} color="text.primary">
                          Personal Record
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                        {pr.result}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {pr.date}
                      </Typography>
                    </Box>
                  )}

                  {/* Stats */}
                  <Box display="flex" justifyContent="space-between" mt="auto" mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      {userResults.length} risultati
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <ClockIcon sx={{ fontSize: 16, mr: 0.5, color: colors.text.secondary }} />
                      <Typography variant="body2" color="text.secondary">
                        {benchmark.type}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Add Result Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PlusIcon />}
                    onClick={() => {
                      setSelectedBenchmark(benchmark)
                      setShowResultForm(true)
                    }}
                    sx={{
                      backgroundColor: colors.primary.main,
                      color: 'black',
                      '&:hover': {
                        backgroundColor: colors.primary.dark
                      }
                    }}
                  >
                    Aggiungi Risultato
                  </Button>

                  {/* Recent Results */}
                  {userResults.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="body2" color="text.secondary" mb={1} fontWeight={500}>
                        Risultati Recenti:
                      </Typography>
                      {userResults.slice(0, 3).map((result) => (
                        <Box
                          key={result.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1,
                            mb: 1,
                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                            borderRadius: 1,
                            '&:hover': {
                              backgroundColor: 'rgba(255, 215, 0, 0.05)',
                            }
                          }}
                        >
                          <Box flex={1}>
                            <Typography variant="body2" color="text.primary" fontWeight={500}>
                              {result.result}
                              {result.is_pr && (
                                <Chip
                                  label="PR"
                                  size="small"
                                  sx={{
                                    ml: 1,
                                    backgroundColor: colors.primary.main,
                                    color: 'black',
                                    fontSize: '0.6rem',
                                    height: 16
                                  }}
                                />
                              )}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(result.date).toLocaleDateString('it-IT')} • {result.scale}
                            </Typography>
                          </Box>
                          <Box display="flex" gap={0.5}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingResult(result)
                                setSelectedBenchmark(benchmark)
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
                              onClick={() => handleDeleteResult(result.id)}
                              sx={{ 
                                color: colors.error.main,
                                '&:hover': { backgroundColor: `${colors.error.main}20` }
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
            </Grid>
          )
        }))}
      </Grid>

      {/* Add Result Modal */}
      <Dialog 
        open={showResultForm && !!selectedBenchmark} 
        onClose={() => setShowResultForm(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: colors.background.card,
            backgroundImage: 'none'
          }
        }}
      >
        {selectedBenchmark && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" color="text.primary">
                Aggiungi Risultato - {selectedBenchmark.name}
              </Typography>
              <IconButton onClick={() => setShowResultForm(false)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box component="form" onSubmit={handleAddResult} sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                      <FormLabel sx={{ mb: 1, color: colors.text.primary }}>
                        Risultato ({selectedBenchmark.type === 'Time' ? 'mm:ss' : selectedBenchmark.type})
                      </FormLabel>
                      <TextField
                        value={resultForm.result}
                        onChange={(e) => setResultForm({...resultForm, result: e.target.value})}
                        placeholder={selectedBenchmark.type === 'Time' ? '8:45' : selectedBenchmark.type === 'Rounds' ? '18' : '120'}
                        fullWidth
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white'
                          }
                        }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid size={12}>
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Scala</FormLabel>
                      <Select
                        value={resultForm.scale}
                        onChange={(e) => setResultForm({...resultForm, scale: e.target.value})}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white'
                          }
                        }}
                      >
                        <MenuItem value="RX">RX</MenuItem>
                        <MenuItem value="RX+">RX+</MenuItem>
                        <MenuItem value="Scaled">Scaled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={12}>
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Data</FormLabel>
                      <TextField
                        type="date"
                        value={resultForm.date}
                        onChange={(e) => setResultForm({...resultForm, date: e.target.value})}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white'
                          }
                        }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid size={12}>
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Note</FormLabel>
                      <TextField
                        multiline
                        rows={4}
                        value={resultForm.notes}
                        onChange={(e) => setResultForm({...resultForm, notes: e.target.value})}
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
                onClick={() => setShowResultForm(false)}
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
                onClick={handleAddResult}
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
          </>
        )}
      </Dialog>

      {/* Edit Result Modal */}
      <Dialog 
        open={showEditForm && !!editingResult} 
        onClose={() => setShowEditForm(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: colors.background.card,
            backgroundImage: 'none'
          }
        }}
      >
        {editingResult && selectedBenchmark && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" color="text.primary">
                Modifica Risultato - {selectedBenchmark.name}
              </Typography>
              <IconButton onClick={() => setShowEditForm(false)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box component="form" onSubmit={handleEditResult} sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Risultato</FormLabel>
                      <TextField
                        value={resultForm.result}
                        onChange={(e) => setResultForm({...resultForm, result: e.target.value})}
                        placeholder={`Inserisci ${selectedBenchmark.type.toLowerCase()}...`}
                        required
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white'
                          }
                        }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid size={6}>
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Scala</FormLabel>
                      <Select
                        value={resultForm.scale}
                        onChange={(e) => setResultForm({...resultForm, scale: e.target.value})}
                        sx={{
                          backgroundColor: 'white'
                        }}
                      >
                        <MenuItem value="RX">RX</MenuItem>
                        <MenuItem value="Scaled">Scaled</MenuItem>
                        <MenuItem value="Masters">Masters</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={6}>
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Data</FormLabel>
                      <TextField
                        type="date"
                        value={resultForm.date}
                        onChange={(e) => setResultForm({...resultForm, date: e.target.value})}
                        required
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white'
                          }
                        }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid size={12}>
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 1, color: colors.text.primary }}>Note</FormLabel>
                      <TextField
                        multiline
                        rows={4}
                        value={resultForm.notes}
                        onChange={(e) => setResultForm({...resultForm, notes: e.target.value})}
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
                onClick={() => setShowEditForm(false)}
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
                onClick={handleEditResult}
                variant="contained"
                sx={{
                  backgroundColor: colors.primary.main,
                  color: 'black',
                  '&:hover': {
                    backgroundColor: colors.primary.dark
                  }
                }}
              >
                Salva Modifiche
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

export default Benchmarks
