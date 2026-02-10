import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './SubjectProgressForm.css'

const CLASS_LABELS = { fe: 'FE', se: 'SE', te: 'TE', be: 'BE' }

export default function SubjectProgressForm() {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const staffId = localStorage.getItem('userId')
  const [subject, setSubject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    target_sem: '',
    lectures_planned_month: '',
    lectures_conducted_month: '',
    lectures_cumulative: '',
    syllabus_completed_month: '',
    syllabus_cumulative: '',
    practical_total: '',
    practical_completed: '',
    assignments_till_date: '',
    assignments_out_of: '',
  })

  const num = (v) => (v === '' ? 0 : parseFloat(v) || 0)
  const lecturesPercent = num(form.target_sem)
    ? Math.round((num(form.lectures_conducted_month) / num(form.target_sem)) * 100)
    : 0

  useEffect(() => {
    const load = async () => {
      const { data: subj } = await supabase.from('subjects').select('id, name, class').eq('id', subjectId).single()
      if (!subj) {
        setLoading(false)
        return
      }
      setSubject(subj)
      const { data: prog } = await supabase
        .from('staff_subject_progress')
        .select('*')
        .eq('staff_id', staffId)
        .eq('subject_id', subjectId)
        .single()
      if (prog) {
        setForm({
          target_sem: prog.target_sem || '',
          lectures_planned_month: prog.lectures_planned_month ?? '',
          lectures_conducted_month: prog.lectures_conducted_month ?? '',
          lectures_cumulative: prog.lectures_cumulative ?? '',
          syllabus_completed_month: prog.syllabus_completed_month ?? '',
          syllabus_cumulative: prog.syllabus_cumulative ?? '',
          practical_total: prog.practical_total ?? '',
          practical_completed: prog.practical_completed ?? '',
          assignments_till_date: prog.assignments_till_date ?? '',
          assignments_out_of: prog.assignments_out_of ?? '',
        })
      }
      setLoading(false)
    }
    if (subjectId && staffId) load()
  }, [subjectId, staffId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      staff_id: staffId,
      subject_id: subjectId,
      target_sem: form.target_sem || null,
      lectures_planned_month: num(form.lectures_planned_month),
      lectures_conducted_month: num(form.lectures_conducted_month),
      lectures_cumulative: num(form.lectures_cumulative),
      syllabus_completed_month: num(form.syllabus_completed_month),
      syllabus_cumulative: num(form.syllabus_cumulative),
      practical_total: num(form.practical_total),
      practical_completed: num(form.practical_completed),
      assignments_till_date: num(form.assignments_till_date),
      assignments_out_of: num(form.assignments_out_of),
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('staff_subject_progress').upsert(payload, {
      onConflict: 'staff_id,subject_id',
    })
    setSaving(false)
    if (!error) alert('Saved successfully')
  }

  const handleBack = () => navigate('/staff')

  if (loading) return <div className="spf-loading">Loading...</div>
  if (!subject) return <div className="spf-error">Subject not found.</div>

  return (
    <div className="subject-progress-form">
      <header className="spf-header">
        <button onClick={handleBack} className="btn-back">← Back</button>
        <h1>{subject.name} ({CLASS_LABELS[subject.class]})</h1>
      </header>
      <main className="spf-content">
        <form onSubmit={handleSubmit} className="progress-form">
        <section className="form-section">
        <h3>No. of Lectures</h3>
          <div className="form-row">
            <label>Target / SEM</label>
            <input type="text" name="target_sem" value={form.target_sem} onChange={handleChange} placeholder="e.g. 1, 2, 3" />
          </div>

          
            
            <div className="form-grid">
              <div className="form-row">
                <label>Planned in Month</label>
                <input type="number" min="0" step="1" name="lectures_planned_month" value={form.lectures_planned_month} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label>Conducted in Month</label>
                <input type="number" min="0" step="1" name="lectures_conducted_month" value={form.lectures_conducted_month} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label>Cumulative Completed</label>
                <input type="number" min="0" step="1" name="lectures_cumulative" value={form.lectures_cumulative} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label>%</label>
                <input type="text" value={`${lecturesPercent}%`} readOnly className="readonly" />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3>% Syllabus Covered</h3>
            <div className="form-grid">
              <div className="form-row">
                <label>Completed in Month</label>
                <input type="number" min="0" max="100" step="0.1" name="syllabus_completed_month" value={form.syllabus_completed_month} onChange={handleChange} placeholder="%" />
              </div>
              <div className="form-row">
                <label>Cumulative Completed</label>
                <input type="number" min="0" max="100" step="0.1" name="syllabus_cumulative" value={form.syllabus_cumulative} onChange={handleChange} placeholder="%" />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3>Practical</h3>
            <div className="form-grid">
              <div className="form-row">
                <label>Total</label>
                <input type="number" min="0" step="1" name="practical_total" value={form.practical_total} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label>Completed</label>
                <input type="number" min="0" step="1" name="practical_completed" value={form.practical_completed} onChange={handleChange} />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3>Assignments till Date / out of</h3>
            <div className="form-grid">
              <div className="form-row">
                <label>Till Date</label>
                <input type="number" min="0" step="1" name="assignments_till_date" value={form.assignments_till_date} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label>Out of</label>
                <input type="number" min="0" step="1" name="assignments_out_of" value={form.assignments_out_of} onChange={handleChange} />
              </div>
            </div>
          </section>

          <div className="form-actions">
            <button type="button" onClick={handleBack} className="btn-cancel">Cancel</button>
            <button type="submit" disabled={saving} className="btn-save">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </main>
    </div>
  )
}
