import React from 'react';
import { Subscriber } from '../../types';
import { Download, Mail, Users } from 'lucide-react';

interface AdminSubscribersProps {
  subscribers: Subscriber[];
}

export const AdminSubscribers: React.FC<AdminSubscribersProps> = ({ subscribers }) => {
  const handleExportCsv = () => {
    if (subscribers.length === 0) return;
    const header = 'ID,Email,Subscribed At\n';
    const rows = subscribers
      .map((s) => `${s.id},"${s.email}","${new Date(s.subscribed_at || Date.now()).toLocaleString()}"`)
      .join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(header + rows);

    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `sk_worl_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase text-white font-sans tracking-tight">
            INSIDERS CLUB SUBSCRIBERS
          </h2>
          <p className="font-mono text-xs uppercase text-neutral-400 mt-1">
            VIEW AND EXPORT EMAILS COLLECTED FROM THE PUBLIC NEWSLETTER FORM
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={subscribers.length === 0}
          className="bg-white text-black hover:bg-neutral-200 px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors disabled:opacity-50"
        >
          <Download size={16} />
          <span>EXPORT TO CSV</span>
        </button>
      </div>

      <div className="bg-neutral-900 border border-white/10 overflow-x-auto">
        {subscribers.length === 0 ? (
          <div className="p-12 text-center font-mono text-xs text-neutral-400 uppercase">
            NO NEWSLETTER SUBSCRIBERS YET
          </div>
        ) : (
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-neutral-400 uppercase bg-black/40">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">SUBSCRIBER EMAIL</th>
                <th className="py-3 px-4">SUBSCRIPTION DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subscribers.map((sub, idx) => (
                <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-neutral-500">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-white flex items-center space-x-2">
                    <Mail size={14} className="text-neutral-500" />
                    <span>{sub.email}</span>
                  </td>
                  <td className="py-3 px-4 text-neutral-400">
                    {new Date(sub.subscribed_at || Date.now()).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
