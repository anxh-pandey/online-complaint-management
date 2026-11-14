import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../api/axios';
import { STATUSES } from '../../utils/constants';
import ComplaintInfo from '../../components/ComplaintInfo';
import ConfirmModal from '../../components/ConfirmModal';
import { PageLoader, Spinner } from '../../components/Spinner';

export default function AdminComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState('Pending');
  const [remarks, setRemarks] = useState('');
  const [remarksError, setRemarksError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const applyComplaint = (c) => {
    setComplaint(c);
    setStatus(c.status);
    setRemarks(c.adminRemarks || '');
  };

  useEffect(() => {
    api
      .get(`/complaints/${id}`)
      .then((res) => applyComplaint(res.data.complaint))
      .catch((err) => {
        toast.error(getErrorMessage(err));
        navigate('/admin/complaints', { replace: true });
      });
  }, [id, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (remarks.length > 1000) {
      setRemarksError('Remarks cannot exceed 1000 characters');
      return;
    }
    setRemarksError('');
    setSaving(true);
    try {
      const { data } = await api.put(`/admin/complaints/${id}/status`, {
        status,
        adminRemarks: remarks.trim(),
      });
      applyComplaint(data.complaint);
      toast.success('Complaint updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/complaints/${id}`);
      toast.success('Complaint deleted');
      navigate('/admin/complaints', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (!complaint) return <PageLoader />;

  const unchanged = status === complaint.status && remarks.trim() === (complaint.adminRemarks || '');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin/complaints" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Back to all complaints
        </Link>
        <button className="btn-danger" onClick={() => setConfirmOpen(true)}>
          <Trash2 className="h-4 w-4" /> Delete complaint
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ComplaintInfo complaint={complaint} showUser />
        </div>

        <form onSubmit={handleSave} className="card h-fit space-y-5 p-6" noValidate>
          <h2 className="text-base font-semibold text-slate-900">Update complaint</h2>

          <div>
            <label className="label" htmlFor="status">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="input">
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="remarks">Admin remarks</label>
            <textarea
              id="remarks"
              rows={5}
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
                setRemarksError('');
              }}
              placeholder="Explain what action was taken or why the complaint was rejected."
              className={`input ${remarksError ? 'input-error' : ''}`}
            />
            <div className="flex justify-between">
              {remarksError ? <p className="error-text">{remarksError}</p> : <span />}
              <span className="mt-1 text-xs text-slate-400">{remarks.length}/1000</span>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={saving || unchanged}>
            {saving ? <Spinner /> : <Save className="h-4 w-4" />}
            Save changes
          </button>
        </form>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Delete complaint?"
        message="This complaint will be permanently removed. This cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
