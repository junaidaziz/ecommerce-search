import { apiFetch } from '@lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useRequireAuth from '@hooks/useRequireAuth';
import type { Message } from '@/types';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';

export default function OrderMessages() {
  const user = useRequireAuth();
  const router = useRouter();
  const { orderId } = router.query;
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState('');

  const fetchMsgs = () => {
    if (!orderId) return;
    apiFetch(`/api/messages/${orderId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMsgs(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchMsgs();
    const i = setInterval(fetchMsgs, 5000);
    return () => clearInterval(i);
  }, [orderId]);

  const send = () => {
    if (!text.trim()) return;
    apiFetch(`/api/messages/${orderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text }),
    })
      .then((res) => res.ok && res.json())
      .then(() => {
        setText('');
        fetchMsgs();
      })
      .catch(() => {});
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Head>
        <title>{getPageTitle('Messages')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Order Messages</h1>
      <div className="border rounded p-2 h-64 overflow-y-auto mb-2 space-y-1">
        {msgs.map((m) => (
          <div key={m.id}>
            <span className="text-xs text-gray-500 mr-2">
              {new Date(m.createdAt).toLocaleString()}
            </span>
            <span>{m.content}</span>
          </div>
        ))}
        {msgs.length === 0 && <p>No messages</p>}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input input-bordered flex-1"
          placeholder="Message"
        />
        <button type="button" className="btn btn-primary" onClick={send}>
          Send
        </button>
      </div>
    </div>
  );
}
