import { useEffect, useState } from 'react';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';

interface CreditData {
  balance: number;
  history: { amount: number; date: string; type: string }[];
}

const CreditBalance: React.FC = () => {
  const [credit, setCredit] = useState<CreditData>({ balance: 0, history: [] });
  useEffect(() => {
    fetch('/api/user/credit')
      .then((res) => (res.ok ? res.json() : { balance: 0, history: [] }))
      .then((data) => setCredit(data))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Head>
        <title>{getPageTitle('Credit Balance')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Credit Balance</h1>
      <p className="mb-2 text-gray-700 dark:text-gray-300">Current Balance: £{credit.balance.toFixed(2)}</p>
      <ul className="space-y-2">
        {credit.history.map((h, idx) => (
          <li key={idx} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 text-gray-900 dark:text-gray-100">
            <span className="mr-2">{h.date}</span>
            {h.type} £{h.amount}
          </li>
        ))}
        {credit.history.length === 0 && <li className="text-gray-500 dark:text-gray-400">No history available.</li>}
      </ul>
    </div>
  );
};

export default CreditBalance;
