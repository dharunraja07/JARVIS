import React, { useState } from 'react';
import { convertCurrency } from '../../services/api/intelligenceService';
import type { CurrencyConversion } from '../../types';
import { POPULAR_CURRENCIES } from '../../utils/constants';
import { ArrowLeftRight, Coins } from 'lucide-react';
import { Button } from '../common/Button';

export const CurrencyTool: React.FC = () => {
  const [amount, setAmount] = useState<number>(100);
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('INR');
  const [loading, setLoading] = useState(false);
  const [conversion, setConversion] = useState<CurrencyConversion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (amount <= 0) return;

    setLoading(true);
    setError(null);
    try {
      const res = await convertCurrency(amount, fromCurr, toCurr);
      setConversion(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Currency conversion failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = fromCurr;
    setFromCurr(toCurr);
    setToCurr(temp);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleConvert} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
          {/* Amount input */}
          <div className="md:col-span-3">
            <label className="block text-xs font-mono text-slate-400 mb-1">
              VALUE / AMOUNT
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full py-2.5 px-3 rounded-xl glass-panel border border-cyan-500/30 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* From Currency */}
          <div className="md:col-span-2">
            <label className="block text-xs font-mono text-slate-400 mb-1">FROM</label>
            <select
              value={fromCurr}
              onChange={(e) => setFromCurr(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl glass-panel border border-cyan-500/30 text-sm font-mono text-slate-100 bg-slate-900 focus:outline-none"
            >
              {POPULAR_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center md:col-span-1 pt-4">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2.5 rounded-xl text-cyan-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 border border-cyan-500/30 transition-all shadow-sm"
              title="Swap currencies"
            >
              <ArrowLeftRight size={16} />
            </button>
          </div>

          {/* To Currency */}
          <div className="md:col-span-1">
            <label className="block text-xs font-mono text-slate-400 mb-1">TO</label>
            <select
              value={toCurr}
              onChange={(e) => setToCurr(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl glass-panel border border-cyan-500/30 text-sm font-mono text-slate-100 bg-slate-900 focus:outline-none"
            >
              {POPULAR_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          type="submit"
          variant="glow"
          disabled={loading || amount <= 0}
          className="w-full"
          icon={<Coins size={16} />}
        >
          {loading ? 'Calculating Exchange...' : 'Compute Exchange Rate'}
        </Button>
      </form>

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Result Display */}
      {conversion && (
        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">
              Reference Exchange Computation
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              ECB Rate as of {conversion.date}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <p className="text-sm font-mono text-slate-400">
                {conversion.amount} {conversion.from} =
              </p>
              <p className="text-3xl font-extrabold font-mono text-cyan-300">
                {conversion.result.toLocaleString()} {conversion.to}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-slate-400">
                1 {conversion.from} = {conversion.rate} {conversion.to}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
