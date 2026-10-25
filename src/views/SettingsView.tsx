import React, { useState } from 'react';
import { 
  Settings, 
  RotateCcw, 
  Download, 
  ShieldCheck, 
  History, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  Trash2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Business, AuditEvent } from '../types';
import { formatDateTimeSA } from '../utils/formatters';
import { exportAuditCSV } from '../services/exportUtils';
import { storage } from '../services/storage';

interface SettingsViewProps {
  business: Business;
  auditLogs: AuditEvent[];
  onResetDemo: () => void;
  onSuccess: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  business,
  auditLogs,
  onResetDemo,
  onSuccess,
}) => {
  const [allowNegativeStock, setAllowNegativeStock] = useState<boolean>(business.allowNegativeStock);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const handleToggleNegativeStock = () => {
    const nextVal = !allowNegativeStock;
    setAllowNegativeStock(nextVal);
    const updated: Business = { ...business, allowNegativeStock: nextVal };
    storage.saveBusiness(updated);
    onSuccess(`Negative stock protection ${nextVal ? 'disabled' : 'enabled'}.`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-stone-700" />
            <span>Settings & Security Audit Trail</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Operational preferences, POPIA data protection guidelines, and immutable audit logging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportAuditCSV(business.name, auditLogs)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Log</span>
          </button>
        </div>
      </div>

      {/* Inventory & Financial Preferences */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Trading & Inventory Preferences
        </h3>

        <div className="space-y-3">
          
          {/* Currency (Fixed ZAR) */}
          <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
            <div>
              <div className="text-xs font-bold text-stone-900">Base Currency</div>
              <div className="text-[11px] text-stone-500">South African Rand (ZAR - R) standard across all ledgers.</div>
            </div>
            <span className="px-2.5 py-1 bg-stone-200 text-stone-800 rounded-lg text-xs font-bold font-mono">
              ZAR (R)
            </span>
          </div>

          {/* Negative Stock Protection */}
          <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
            <div>
              <div className="text-xs font-bold text-stone-900">Prevent Negative Stock</div>
              <div className="text-[11px] text-stone-500">
                Block sales from reducing inventory below zero when recorded stock is exhausted.
              </div>
            </div>
            <button
              onClick={handleToggleNegativeStock}
              className={`p-1 text-2xl transition ${!allowNegativeStock ? 'text-emerald-700' : 'text-stone-400'}`}
            >
              {!allowNegativeStock ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>

        </div>
      </div>

      {/* Demo Reset Panel */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <RotateCcw className="w-4 h-4 text-amber-700" />
          <span>FNB Hackathon Demo Environment Reset</span>
        </div>
        <p className="text-xs text-amber-950 leading-relaxed max-w-xl">
          Resetting will restore the pristine 30-day benchmark data for <strong className="text-stone-900">Thabo's Corner Store</strong> in Orlando West, Soweto. All custom sales or voids created during testing will be refreshed.
        </p>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          Reset Demo Data to Benchmark
        </button>
      </div>

      {/* Audit Log Table (Chronological System Trail) */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden space-y-3 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <History className="w-4 h-4 text-stone-700" />
              <span>Immutable Audit Trail ({auditLogs.length} events)</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Every critical action (sales, expenses, voids, inventory adjustments) is logged with a permanent timestamp.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-stone-100 rounded-2xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
              {auditLogs.slice(0, 30).map((log) => (
                <tr key={log.id} className="hover:bg-stone-50/70 transition">
                  <td className="p-3 text-stone-500 whitespace-nowrap">
                    {formatDateTimeSA(log.timestamp)}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-stone-600 uppercase text-[10px] whitespace-nowrap">
                    {log.entityType}
                  </td>
                  <td className="p-3 text-stone-700 max-w-md truncate font-sans">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPIA & Privacy Policy Section */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs space-y-3 text-xs text-stone-600 leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Protection of Personal Information Act (POPIA) Statement</span>
        </div>
        <p>
          KhulaBiz complies with the South African Protection of Personal Information Act (Act 4 of 2013). We adhere to strict data minimisation: we only collect business operational records entered directly by the business owner. No personal banking passwords, ID numbers, or biometrics are ever stored.
        </p>
        <p>
          Your customer phone numbers entered in the credit book are stored exclusively on your device/workspace and are never sold or shared with third parties or external marketing networks.
        </p>
      </div>

      {/* Demo Reset Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-stone-900">Reset Demo Benchmark Data?</h3>
              <p className="text-xs text-stone-600 mt-1">
                This restores Thabo's Corner Store back to its clean initial hackathon benchmark dataset with all 30 days of sales and stock levels.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetDemo();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
