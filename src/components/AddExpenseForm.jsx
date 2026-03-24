// src/components/AddExpenseForm.jsx

import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Plus, Trash2, X, Check, UserCircle, ChevronDown } from 'lucide-react';
import CurrencyInput from './CurrencyInput';

const TRAVEL_CATEGORY = 'Travel';

const sel = 'w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400';
const inp = 'w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm placeholder-purple-300 focus:outline-none focus:border-purple-400';

// ── Owner avatar chip ─────────────────────────────────────────────────────────
const ownerOf = (name = '') => {
  if (name.toUpperCase().startsWith('J')) return { label: 'J', color: 'bg-violet-500' };
  if (name.toUpperCase().startsWith('A')) return { label: 'A', color: 'bg-pink-500' };
  return null;
};

// ── Paid By dropdown — grouped J*/A* with inline delete ──────────────────────
const PaidBySelect = ({ value, onChange, options, onAdd, onDelete }) => {
  const [open,    setOpen]    = useState(false);
  const [adding,  setAdding]  = useState(false);
  const [newName, setNewName] = useState('');
  const ref    = useRef(); // kept for legacy compat — not used for close detection
  const btnRef = useRef();
  const [pos,  setPos]        = useState({ top: 0, left: 0, width: 0 });

  const menuRef = useRef();

  const calcPos = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    }
  };

  // Close on outside click, reposition on scroll
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!btnRef.current?.contains(e.target) && !menuRef.current?.contains(e.target))
        setOpen(false);
    };
    const onScroll = (e) => { if (menuRef.current?.contains(e.target)) return; setOpen(false); };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  const handleOpen = () => {
    calcPos();
    setOpen(o => !o);
  };

  const jOptions = options.filter(o => o.toUpperCase().startsWith('J'));
  const aOptions = options.filter(o => o.toUpperCase().startsWith('A'));
  const other    = options.filter(o => !o.toUpperCase().startsWith('J') && !o.toUpperCase().startsWith('A'));

  const owner = ownerOf(value);

  const handleAdd = () => {
    if (onAdd(newName)) { setNewName(''); setAdding(false); }
  };

  const OptionRow = ({ opt }) => {
    const ow = ownerOf(opt);
    return (
      <div className={`flex items-center justify-between px-3 py-2 hover:bg-white/8 transition-colors group
        ${opt === value ? 'bg-purple-500/20' : ''}`}>
        <button type="button" onClick={() => { onChange(opt); setOpen(false); }}
          className="flex-1 text-left text-sm text-white flex items-center gap-2">
          {ow && (
            <span className={`${ow.label === 'J' ? 'bg-violet-500' : 'bg-pink-500'} text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0`}>
              {ow.label}
            </span>
          )}
          {opt}
          {opt === value && <Check className="w-3 h-3 text-purple-400 ml-auto" />}
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(opt); }}
          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-0.5 rounded transition-all ml-2"
          title={`Delete ${opt}`}>
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  const GroupLabel = ({ label }) => (
    <div className="px-3 pt-2 pb-0.5">
      <span className="text-purple-600 text-[10px] font-semibold uppercase tracking-wide">{label}</span>
    </div>
  );

  return (
    <div className="relative">
      <button ref={btnRef} type="button" onClick={handleOpen}
        className={`${sel} flex items-center gap-2 text-left w-full`}>
        {owner
          ? <span className={`${owner.label === 'J' ? 'bg-violet-500' : 'bg-pink-500'} text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0`}>{owner.label}</span>
          : <UserCircle className="w-4 h-4 text-purple-500 shrink-0" />}
        <span className={value ? 'text-white flex-1' : 'text-purple-400 flex-1'}>{value || 'Select person'}</span>
        <ChevronDown className={`w-4 h-4 text-purple-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && ReactDOM.createPortal(
        <div
          ref={menuRef}
          className="bg-slate-900 border border-white/20 rounded-xl shadow-2xl overflow-hidden"
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, minWidth: 200, zIndex: 9999 }}
        >
          <button type="button" onClick={() => { onChange(''); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-purple-500 text-sm hover:bg-white/10 transition-colors">
            — None —
          </button>

          <div className="max-h-48 overflow-y-auto">
            {jOptions.length > 0 && <><GroupLabel label="J (you)" />{jOptions.map(o => <OptionRow key={o} opt={o} />)}</>}
            {aOptions.length > 0 && <><GroupLabel label="A (wife)" />{aOptions.map(o => <OptionRow key={o} opt={o} />)}</>}
            {other.length > 0   && <><GroupLabel label="Other"    />{other.map(o    => <OptionRow key={o} opt={o} />)}</>}
            <div className="px-3 py-2 hover:bg-white/10 transition-colors">
              <button type="button" onClick={() => { onChange('Both'); setOpen(false); }}
                className={`w-full text-left text-sm text-white ${value === 'Both' ? 'font-semibold' : ''}`}>
                Both {value === 'Both' && <Check className="w-3 h-3 text-purple-400 inline ml-1" />}
              </button>
            </div>
          </div>

          <div className="border-t border-white/10 px-3 py-2">
            {!adding ? (
              <button type="button" onClick={() => setAdding(true)}
                className="text-purple-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add person
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <input autoFocus type="text" placeholder="e.g. J Chase" value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setAdding(false); setNewName(''); } }}
                  className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-purple-400" />
                <button type="button" onClick={handleAdd} className="text-green-400 hover:text-green-300"><Check className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => { setAdding(false); setNewName(''); }} className="text-red-400 hover:text-red-300"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// ── Reusable dropdown with inline delete per option ───────────────────────────
const ManageableSelect = ({ value, onChange, options, onAddNew, onDelete, placeholder }) => {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState({ top: 0, left: 0, width: 0 });
  const btnRef  = useRef();
  const menuRef = useRef();

  const calcPos = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!btnRef.current?.contains(e.target) && !menuRef.current?.contains(e.target))
        setOpen(false);
    };

    const onScroll = (e) => { if (menuRef.current?.contains(e.target)) return; setOpen(false); };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  const handleOpen = () => {
    calcPos();
    setOpen(o => !o);
  };

  const menu = open && ReactDOM.createPortal(
    <div
      ref={menuRef}
      className="bg-slate-900 border border-white/20 rounded-xl shadow-2xl overflow-hidden"
      style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, minWidth: 180, zIndex: 9999 }}
    >
      <button type="button" onClick={() => { onChange(''); setOpen(false); }}
        className="w-full text-left px-3 py-2 text-purple-500 text-sm hover:bg-white/10 transition-colors">
        — None —
      </button>
      <div className="max-h-44 overflow-y-auto">
        {options.map(opt => (
          <div key={opt} className={`flex items-center justify-between px-3 py-1.5 hover:bg-white/10 transition-colors group ${opt === value ? 'bg-purple-500/20' : ''}`}>
            <button type="button" onClick={() => { onChange(opt); setOpen(false); }}
              className="flex-1 text-left text-sm text-white">
              {opt}{opt === value && <Check className="w-3 h-3 text-purple-400 inline ml-2" />}
            </button>
            {onDelete && (
              <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(opt); }}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-0.5 transition-all ml-1">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      {onAddNew && (
        <button type="button" onClick={() => { onAddNew(); setOpen(false); }}
          className="w-full text-left px-3 py-2 text-purple-400 hover:text-white hover:bg-white/10 text-sm border-t border-white/10 transition-colors flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add New
        </button>
      )}
    </div>,
    document.body
  );

  return (
    <div className="relative">
      <button ref={btnRef} type="button" onClick={handleOpen}
        className={`${sel} flex items-center justify-between text-left`}>
        <span className={value ? 'text-white' : 'text-purple-400'}>{value || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-purple-400 shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {menu}
    </div>
  );
};

// ── Category select ───────────────────────────────────────────────────────────
const CategorySelect = ({ value, onChange, categories, onAddNew, onDelete }) => (
  <ManageableSelect
    value={value}
    onChange={onChange}
    options={categories}
    onAddNew={onAddNew}
    onDelete={onDelete}
    placeholder="Select Category"
  />
);

// ── Payment type select ───────────────────────────────────────────────────────
const PaymentTypeSelect = ({ value, onChange, paymentTypes, onAddNew, onDelete }) => (
  <ManageableSelect
    value={value}
    onChange={onChange}
    options={paymentTypes}
    onAddNew={onAddNew}
    onDelete={onDelete}
    placeholder="Select Type"
  />
);

// ── Trip selector (Travel only) ───────────────────────────────────────────────
const TripSelect = ({ value, onChange, trips, onAdd, onDelete }) => {
  const [open,    setOpen]    = useState(false);
  const [adding,  setAdding]  = useState(false);
  const [newName, setNewName] = useState('');
  const ref    = useRef();
  const btnRef = useRef();
  const [pos,  setPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (!open) return;
    const onDown   = (e) => { if (!btnRef.current?.contains(e.target) && !ref.current?.contains(e.target)) setOpen(false); };
    const onScroll = (e) => { if (ref.current?.contains(e.target)) return; setOpen(false); };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onScroll, true);
    return () => { document.removeEventListener('mousedown', onDown); window.removeEventListener('scroll', onScroll, true); };
  }, [open]);

  const handleOpen = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    }
    setOpen(o => !o);
  };

  const handleAdd = () => { if (onAdd(newName)) { setNewName(''); setAdding(false); } };

  return (
    <div className="relative">
      <button ref={btnRef} type="button" onClick={handleOpen}
        className={`${sel} flex items-center gap-2 text-left w-full`}>
        <span className="text-base shrink-0">✈️</span>
        <span className={`flex-1 ${value ? 'text-white' : 'text-purple-400'}`}>{value || 'Select trip (optional)'}</span>
        <ChevronDown className={`w-4 h-4 text-purple-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && ReactDOM.createPortal(
        <div ref={ref}
          className="bg-slate-900 border border-white/20 rounded-xl shadow-2xl overflow-hidden"
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, minWidth: 220, zIndex: 9999 }}>

          <button type="button" onClick={() => { onChange(''); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-purple-500 text-sm hover:bg-white/10 transition-colors">
            — None —
          </button>

          <div className="max-h-48 overflow-y-auto">
            {trips.length === 0 && (
              <p className="text-purple-600 text-xs text-center py-3">No trips yet — add one below</p>
            )}
            {trips.map(t => (
              <div key={t} className={`flex items-center justify-between px-3 py-2 hover:bg-white/10 transition-colors group ${t === value ? 'bg-violet-500/20' : ''}`}>
                <button type="button" onClick={() => { onChange(t); setOpen(false); }}
                  className="flex-1 text-left text-sm text-white flex items-center gap-2">
                  ✈️ {t}
                  {t === value && <Check className="w-3 h-3 text-violet-400 ml-auto" />}
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(t); }}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-0.5 transition-all ml-2">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 px-3 py-2">
            {!adding ? (
              <button type="button" onClick={() => setAdding(true)}
                className="text-violet-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
                <Plus className="w-3.5 h-3.5" /> New trip
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <input autoFocus type="text" placeholder="e.g. Mexico - Cabos 2026" value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setAdding(false); setNewName(''); } }}
                  className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-violet-400" />
                <button type="button" onClick={handleAdd} className="text-green-400 hover:text-green-300"><Check className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => { setAdding(false); setNewName(''); }} className="text-red-400 hover:text-red-300"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
const NewItemRow = ({ label, value, onChange, onAdd, onCancel, colSpan = 6 }) => (
  <tr className="border-b border-white/10 bg-white/5">
    <td colSpan={colSpan} className="py-2 px-2">
      <div className="flex gap-2 items-center">
        <span className="text-purple-200 text-sm font-medium whitespace-nowrap">{label}:</span>
        <input type="text" placeholder="Enter name" value={value} onChange={e => onChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onAdd(); if (e.key === 'Escape') onCancel(); }}
          className="flex-1 bg-white/20 border border-white/30 rounded-lg px-3 py-1.5 text-white text-sm placeholder-purple-300 focus:outline-none focus:border-purple-400" />
        <button onClick={onAdd} className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-all">Add</button>
        <button onClick={onCancel} className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-all">Cancel</button>
      </div>
    </td>
  </tr>
);

// ── Main form ─────────────────────────────────────────────────────────────────
const AddExpenseForm = ({
  title,
  formData, setFormData,
  categories, paymentTypes, paidByOptions = [],
  showNewCategoryInput, setShowNewCategoryInput,
  newCategoryName, setNewCategoryName, handleAddCategory,
  onDeleteCategory,
  showNewPaymentTypeInput, setShowNewPaymentTypeInput,
  newPaymentTypeName, setNewPaymentTypeName, handleAddPaymentType,
  onDeletePaymentType,
  onAddPaidBy, onDeletePaidBy,
  trips = [],
  onAddTrip, onDeleteTrip,
  handleAddExpense,
  showAmountField   = true,
  amountRequired    = false,
  amountDisabled    = false,
  subTransactionComponent = null,
}) => {
  const isTravel = formData.category === TRAVEL_CATEGORY;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
      {title && (
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />{title}
        </h2>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody>

            {/* ── Row 1: Date · Category · Description ─────────────────────── */}
            <tr className="border-b border-white/10">
              <td className="py-3 pr-2 text-purple-200 font-medium text-sm whitespace-nowrap align-top w-16">Date *</td>
              <td className="py-3 pr-4 align-top" style={{ width: '160px' }}>
                <input type="date" value={formData.date}
                  onChange={(e) => {
                    const d = new Date(e.target.value + 'T00:00:00Z');
                    setFormData({ ...formData, date: e.target.value,
                      month: d.toLocaleString('default', { month: 'long', timeZone: 'UTC' }) });
                  }}
                  className={inp} required />
              </td>

              <td className="py-3 pr-2 text-purple-200 font-medium text-sm whitespace-nowrap align-top w-20">Category *</td>
              <td className="py-3 pr-4 align-top" style={{ width: '220px' }}>
                <CategorySelect
                  value={formData.category}
                  onChange={(v) => {
                    const leaving = formData.category === TRAVEL_CATEGORY && v !== TRAVEL_CATEGORY;
                    setFormData({ ...formData, category: v,
                      ...(leaving ? { foreignAmount: null, foreignCurrency: null, exchangeRate: null, foreignAmountUSD: null } : {}) });
                  }}
                  categories={categories}
                  onAddNew={() => setShowNewCategoryInput(true)}
                  onDelete={onDeleteCategory}
                />
              </td>

              <td className="py-3 pr-2 text-purple-200 font-medium text-sm whitespace-nowrap align-top w-24">
                Description {!amountRequired && '*'}
              </td>
              <td className="py-3 align-top">
                <input type="text" placeholder="Enter description" value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className={inp} required={!amountRequired} />
              </td>
            </tr>

            {showNewCategoryInput && (
              <NewItemRow label="New Category" value={newCategoryName} onChange={setNewCategoryName}
                onAdd={handleAddCategory} onCancel={() => { setShowNewCategoryInput(false); setNewCategoryName(''); }} />
            )}

            {/* ── Row 2: Amount · Payment Type · Paid By ───────────────────── */}
            <tr className="border-b border-white/10">
              {showAmountField && (
                <>
                  <td className="py-3 pr-2 text-purple-200 font-medium text-sm whitespace-nowrap align-top">
                    Amount {amountRequired && '*'}
                    {isTravel && formData.foreignAmountUSD && (
                      <div className="text-violet-400 text-[10px] font-normal mt-0.5">← auto-filled</div>
                    )}
                  </td>
                  <td className="py-3 pr-4 align-top" style={{ width: '220px' }}>
                    <input type="number" step="0.01" placeholder="0.00" value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      className={`${inp} ${isTravel && formData.foreignAmountUSD ? '!bg-violet-500/15 !border-violet-500/50' : ''}`}
                      disabled={amountDisabled} required={amountRequired} />
                    {isTravel && (
                      <CurrencyInput formData={formData} setFormData={setFormData} date={formData.date} />
                    )}
                  </td>
                </>
              )}

              <td className="py-3 pr-2 text-purple-200 font-medium text-sm whitespace-nowrap align-top">Payment Type</td>
              <td className="py-3 pr-4 align-top" style={{ width: '220px' }}>
                <PaymentTypeSelect
                  value={formData.paymentType}
                  onChange={v => setFormData({ ...formData, paymentType: v })}
                  paymentTypes={paymentTypes}
                  onAddNew={() => setShowNewPaymentTypeInput(true)}
                  onDelete={onDeletePaymentType}
                />
              </td>

              <td className="py-3 pr-2 text-purple-200 font-medium text-sm whitespace-nowrap align-top">Paid By</td>
              <td className="py-3 align-top">
                <PaidBySelect
                  value={formData.by}
                  onChange={v => setFormData({ ...formData, by: v })}
                  options={paidByOptions}
                  onAdd={onAddPaidBy}
                  onDelete={onDeletePaidBy}
                />
              </td>
            </tr>

            {showNewPaymentTypeInput && (
              <NewItemRow label="New Payment Type" value={newPaymentTypeName} onChange={setNewPaymentTypeName}
                onAdd={handleAddPaymentType} onCancel={() => { setShowNewPaymentTypeInput(false); setNewPaymentTypeName(''); }} />
            )}

            {/* ── Travel-only: Trip row ─────────────────────────────────────── */}
            {isTravel && (
              <tr className="border-b border-white/10">
                <td className="py-3 pr-2 text-purple-200 font-medium text-sm whitespace-nowrap align-top">
                  <div className="flex items-center gap-1.5">
                    <span>✈️</span>
                    <span>Trip</span>
                  </div>
                </td>
                <td colSpan={5} className="py-3 align-top">
                  <TripSelect
                    value={formData.trip || ''}
                    onChange={v => setFormData({ ...formData, trip: v })}
                    trips={trips}
                    onAdd={onAddTrip}
                    onDelete={onDeleteTrip}
                  />
                </td>
              </tr>
            )}

            {/* ── Note row (shows when filled or always optional) ───────────── */}
            {(formData.note !== undefined || true) && (
              <tr className="border-b border-white/10">
                <td className="py-3 pr-2 text-purple-200 font-medium text-sm whitespace-nowrap align-top">Note</td>
                <td colSpan={5} className="py-3 align-top">
                  <textarea
                    placeholder="Optional note, receipt details, or photo URL..."
                    value={formData.note || ''}
                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                    rows={2}
                    className={inp + ' resize-none'}
                    style={{ minHeight: '56px' }}
                  />
                </td>
              </tr>
            )}

            {/* ── Row 3: Status · Submit ────────────────────────────────────── */}
            <tr>
              <td className="py-3 pr-2 text-purple-200 font-medium text-sm whitespace-nowrap align-top">Status</td>
              <td className="py-3 pr-4 align-top">
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className={sel}>
                  <option value="PAID">PAID</option>
                  <option value="PENDING">PENDING</option>
                  <option value="OVERDUE">OVERDUE</option>
                </select>
              </td>
              <td colSpan="4" className="py-3 align-top">
                <div className="flex justify-end">
                  <button onClick={handleAddExpense}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg px-6 py-2 transition-all flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" /> Add Expense
                  </button>
                </div>
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      {subTransactionComponent && <div className="mt-4">{subTransactionComponent}</div>}
    </div>
  );
};

export default AddExpenseForm;