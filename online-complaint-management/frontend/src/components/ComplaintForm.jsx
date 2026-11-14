import { useEffect, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { CATEGORIES, PRIORITIES, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from '../utils/constants';
import { imageUrl } from '../api/axios';
import { Spinner } from './Spinner';

const EMPTY = { title: '', description: '', category: '', location: '', priority: 'Medium' };

// Used for both "Submit complaint" and "Edit complaint".
// Calls onSubmit(FormData) when the form is valid.
export default function ComplaintForm({ initial, submitting, submitLabel = 'Submit Complaint', onSubmit, onCancel }) {
  const [values, setValues] = useState({ ...EMPTY, ...pick(initial) });
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [removeExisting, setRemoveExisting] = useState(false);

  // Local preview for the newly selected image
  useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: '' }));
  };

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (!ALLOWED_IMAGE_TYPES.includes(selected.type)) {
      setErrors((er) => ({ ...er, image: 'Only JPG, PNG, WEBP or GIF images are allowed' }));
      e.target.value = '';
      return;
    }
    if (selected.size > MAX_IMAGE_SIZE) {
      setErrors((er) => ({ ...er, image: 'Image must be smaller than 3 MB' }));
      e.target.value = '';
      return;
    }
    setErrors((er) => ({ ...er, image: '' }));
    setFile(selected);
  };

  const validate = () => {
    const e = {};
    const title = values.title.trim();
    const description = values.description.trim();

    if (title.length < 5) e.title = 'Title must be at least 5 characters';
    else if (title.length > 120) e.title = 'Title cannot exceed 120 characters';

    if (description.length < 10) e.description = 'Description must be at least 10 characters';
    else if (description.length > 2000) e.description = 'Description cannot exceed 2000 characters';

    if (!values.category) e.category = 'Please select a category';
    if (!values.location.trim()) e.location = 'Location is required';
    else if (values.location.trim().length > 120) e.location = 'Location cannot exceed 120 characters';
    if (!values.priority) e.priority = 'Please select a priority';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    Object.entries(values).forEach(([key, val]) => formData.append(key, val.trim ? val.trim() : val));
    if (file) formData.append('image', file);
    else if (removeExisting) formData.append('removeImage', 'true');

    onSubmit(formData);
  };

  const existingImage = initial?.image && !removeExisting && !file ? imageUrl(initial.image) : '';
  const shownImage = preview || existingImage;

  return (
    <form onSubmit={handleSubmit} noValidate className="card space-y-5 p-6">
      <div>
        <label className="label" htmlFor="title">Complaint title *</label>
        <input
          id="title"
          name="title"
          value={values.title}
          onChange={handleChange}
          placeholder="e.g. Water leakage in Hostel Block B"
          className={`input ${errors.title ? 'input-error' : ''}`}
        />
        {errors.title && <p className="error-text">{errors.title}</p>}
      </div>

      <div>
        <label className="label" htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          rows={5}
          value={values.description}
          onChange={handleChange}
          placeholder="Describe the problem in detail: what happened, since when, and how it affects you."
          className={`input ${errors.description ? 'input-error' : ''}`}
        />
        <div className="flex justify-between">
          {errors.description ? <p className="error-text">{errors.description}</p> : <span />}
          <span className="mt-1 text-xs text-slate-400">{values.description.length}/2000</span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={values.category}
            onChange={handleChange}
            className={`input ${errors.category ? 'input-error' : ''}`}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.category && <p className="error-text">{errors.category}</p>}
        </div>

        <div>
          <label className="label" htmlFor="priority">Priority *</label>
          <select
            id="priority"
            name="priority"
            value={values.priority}
            onChange={handleChange}
            className={`input ${errors.priority ? 'input-error' : ''}`}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {errors.priority && <p className="error-text">{errors.priority}</p>}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="location">Location *</label>
        <input
          id="location"
          name="location"
          value={values.location}
          onChange={handleChange}
          placeholder="e.g. Hostel Block B, 2nd floor"
          className={`input ${errors.location ? 'input-error' : ''}`}
        />
        {errors.location && <p className="error-text">{errors.location}</p>}
      </div>

      <div>
        <label className="label">Image (optional)</label>
        {shownImage ? (
          <div className="relative inline-block">
            <img src={shownImage} alt="Attachment preview" className="max-h-48 rounded-lg border border-slate-200" />
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setRemoveExisting(true);
              }}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-900"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="image"
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 hover:border-blue-400 hover:bg-blue-50/40"
          >
            <ImagePlus className="mb-2 h-7 w-7 text-slate-400" />
            <span className="font-medium text-blue-600">Click to upload an image</span>
            <span className="text-xs">JPG, PNG, WEBP or GIF, up to 3 MB</span>
          </label>
        )}
        <input id="image" type="file" accept={ALLOWED_IMAGE_TYPES.join(',')} onChange={handleFile} className="hidden" />
        {errors.image && <p className="error-text">{errors.image}</p>}
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting && <Spinner />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function pick(initial) {
  if (!initial) return {};
  const { title, description, category, location, priority } = initial;
  return { title, description, category, location, priority };
}
