"use client";

import React, { useState, useEffect } from 'react';
import { getTransactionsAction } from './actions';
import { Transactions } from '@/types/appwrite.d.ts';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';

export default function TransactionsPageClient() {
  const [transactions, setTransactions] = useState<Transactions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const fetchedTransactions = await getTransactionsAction();
        setTransactions(fetchedTransactions);
      } catch (err) {
        setError('Failed to fetch transactions.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;
  const formatTimestamp = (timestamp: string) => new Date(timestamp).toLocaleString();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="text-gray-500">View all your past transactions.</p>
      </header>

      {isLoading && (
        <Card className="p-6 text-center">
          <p>Loading transactions...</p>
        </Card>
      )}

      {error && (
        <Card className="p-6 text-center text-red-500">
          <p>{error}</p>
        </Card>
      )}

      {!isLoading && !error && transactions.length === 0 && (
        <Card className="p-6 text-center">
          <p>No transactions found.</p>
        </Card>
      )}

      {!isLoading && !error && transactions.length > 0 && (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <Card key={tx.$id} className="p-4">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div>
                  <p className="font-semibold">{tx.type === 'send' ? 'Sent' : 'Received'}</p>
                  <p className="text-sm text-gray-500">{formatTimestamp(tx.timestamp)}</p>
                </div>
                <div>
                  <p className="text-sm">From: {formatAddress(tx.fromAddress)}</p>
                  <p className="text-sm">To: {formatAddress(tx.toAddress)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{tx.value} ETH</p>
                  <p className={`text-sm ${tx.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {tx.status}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
