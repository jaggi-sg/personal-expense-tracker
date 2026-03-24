// src/components/ExpenseRowBadges.js
// Plain JS (no JSX) — avoids oxc multi-line attribute issues

import React from 'react';
import {
  Check, Edit2, Copy, SkipForward, Trash2, MoreHorizontal,
  Globe,
} from 'lucide-react';
import { TRAVEL_CURRENCIES } from '../hooks/useCurrencyConverter';

const e = React.createElement;

export const STATUS_STYLES = {
  PAID:    'bg-green-500/20 text-green-300 border-green-500/40 hover:bg-green-500/35',
  PENDING: 'bg-orange-500/20 text-orange-300 border-orange-500/40 hover:bg-orange-500/35',
  OVERDUE: 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/35',
  SKIPPED: 'bg-slate-500/20 text-slate-300 border-slate-500/40 cursor-default',
};

export const STATUS_BORDER = {
  PAID:    'border-l-2 border-l-green-500',
  PENDING: 'border-l-2 border-l-orange-400',
  OVERDUE: 'border-l-2 border-l-red-500',
  SKIPPED: 'border-l-2 border-l-slate-500',
};

export const STATUS_CYCLE = ['PAID', 'PENDING', 'OVERDUE'];

export function InlineStatusBadge({ status, onToggle }) {
  const canToggle = status !== 'SKIPPED';
  const cls = 'px-2 py-0.5 rounded border text-xs font-semibold whitespace-nowrap transition-colors '
    + (STATUS_STYLES[status] || STATUS_STYLES.PENDING);
  return e('button', {
    onClick: function(ev) { ev.stopPropagation(); canToggle && onToggle(); },
    title: canToggle ? 'Click to change status' : status,
    className: cls,
  }, status);
}

export function FxBadge({ expense }) {
  if (!expense.foreignAmount || !expense.foreignCurrency) return null;
  const info = TRAVEL_CURRENCIES.find(c => c.code === expense.foreignCurrency);
  const rate = expense.exchangeRate;
  const rateStr = rate ? (' @ ' + (rate < 0.01 ? rate.toFixed(6) : rate.toFixed(4))) : '';
  const label = (info ? info.flag + ' ' : '') + parseFloat(expense.foreignAmount).toLocaleString() + ' ' + expense.foreignCurrency + rateStr;
  return e('div', { className: 'flex items-center gap-1 mt-0.5' },
    e(Globe, { className: 'w-2.5 h-2.5 text-violet-400 shrink-0' }),
    e('span', { className: 'text-violet-300 text-[10px] font-medium whitespace-nowrap' }, label)
  );
}

export class ActionMenuWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
    this.ref = React.createRef();
    this.handleOutside = this.handleOutside.bind(this);
  }
  componentDidMount() { document.addEventListener('mousedown', this.handleOutside); }
  componentWillUnmount() { document.removeEventListener('mousedown', this.handleOutside); }
  handleOutside(ev) {
    if (this.ref.current && !this.ref.current.contains(ev.target)) this.setState({ open: false });
  }
  render() {
    const { expense, onEdit, onDelete, onClone, onSkipMonth, onMarkPaid } = this.props;
    const { open } = this.state;
    const showMarkPaid = expense.status !== 'PAID' && expense.status !== 'SKIPPED';
    const close = () => this.setState({ open: false });

    const menuItems = [];
    if (showMarkPaid) menuItems.push(
      e('button', {
        key: 'pay', onClick: function() { onMarkPaid(); close(); },
        className: 'w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold bg-green-500/15 hover:bg-green-500/25 text-green-300 border-b border-white/10 transition-colors',
      }, e(Check, { className: 'w-3.5 h-3.5 shrink-0' }), 'Mark as Paid')
    );
    menuItems.push(
      e('button', {
        key: 'edit', onClick: function() { onEdit(); close(); },
        className: 'w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium hover:bg-white/10 text-blue-300 transition-colors',
      }, e(Edit2, { className: 'w-3.5 h-3.5 shrink-0' }), ' Edit')
    );
    if (onClone) menuItems.push(
      e('button', {
        key: 'clone', onClick: function() { onClone(expense); close(); },
        className: 'w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium hover:bg-white/10 text-green-300 transition-colors',
      }, e(Copy, { className: 'w-3.5 h-3.5 shrink-0' }), ' Clone')
    );
    if (onSkipMonth) menuItems.push(
      e('button', {
        key: 'skip', onClick: function() { onSkipMonth(expense); close(); },
        className: 'w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium hover:bg-white/10 text-orange-300 transition-colors',
      }, e(SkipForward, { className: 'w-3.5 h-3.5 shrink-0' }), ' Skip month')
    );
    menuItems.push(e('div', { key: 'div', className: 'border-t border-white/10 my-0.5' }));
    menuItems.push(
      e('button', {
        key: 'del', onClick: function() { onDelete(); close(); },
        className: 'w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium hover:bg-white/10 text-red-300 transition-colors',
      }, e(Trash2, { className: 'w-3.5 h-3.5 shrink-0' }), ' Delete')
    );

    return e('div', { ref: this.ref, className: 'relative', onClick: function(ev) { ev.stopPropagation(); } },
      e('button', {
        onClick: () => this.setState({ open: !open }),
        className: 'text-purple-400 hover:text-white hover:bg-white/10 rounded p-1 transition-all',
      }, e(MoreHorizontal, { className: 'w-4 h-4' })),
      open && e('div', {
        className: 'absolute right-0 top-full mt-1 bg-slate-900 border border-white/15 rounded-xl shadow-2xl z-30 overflow-hidden w-40',
      }, ...menuItems)
    );
  }
}