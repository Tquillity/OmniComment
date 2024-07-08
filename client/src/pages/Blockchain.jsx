// Blockchain.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

const Blockchain = () => {
  const [blockchainData, setBlockchainData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [miningStatus, setMiningStatus] = useState('');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchBlockchainData();
    fetchTransactions();
  },[]);

  const fetchBlockchainData = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/v1/blockchain');
      console.log('API Response:', response.data) // ! Debugging
      if (response.data.success && Array.isArray(response.data.data)) {
        setBlockchainData(response.data.data);
      } else {
        setError('Unexpected data format received from server');
      }   
      setLoading(false);
    } catch(err) {
      console.error('Error fetching blockchain data', err);
      setError('Error fetching blockchain data');
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/v1/wallet/transactions');
      if (response.data.success) {
        setTransactions(Object.values(response.data.data));
      } else {
        setError('Failed to fetch transactions');
      }
    } catch (err) {
      console.error('Error fetching transactions', err);
      setError('Error fetching transactions');
    }
  };

  const mineBlock = async () => {
    setMiningStatus('Mining block...');
    try {
      const response = await axios.post('http://localhost:5001/api/v1/block/mine');
      if (response.data.success) {
        setMiningStatus('Block mined successfully');
        fetchBlockchainData();
      } else {
        setMiningStatus('Failed to mine Block.');
      }
    } catch (err) {
      console.error('Error mining block', err);
      setMiningStatus('Error mining block');
    }
  };

  const renderBlockchainData = () => {
    if (loading) return <p>Loading blockchain data...</p>;
    if (error) return <p>{error}</p>;
    if (blockchainData.length === 0) return <p>No blockchain data found</p>;

    return blockchainData.map((block, index) => (
      <div key={index} className="block">
        <h3>Block {index}</h3>
        <p>Hash: {block.hash}</p>
        <p>Previous Hash: {block.lastHash}</p>
        <p>Timestamp: {new Date(block.timestamp).toLocaleString()}</p>
        <p>Nonce: {block.nonce}</p>
        <p>Difficulty: {block.difficulty}</p>
        <details>
          <summary>Data</summary>
          <pre>{JSON.stringify(block.data, null, 2)}</pre>
        </details>
      </div>
    ));
  };

  const renderTransactions = () => {
    if (transactions.length === 0) return <p>No transactions found</p>;

    return transactions.map((transaction, index) => (
      <div key={index} className="transaction">
      <h3>Transaction {index}</h3>
      <p>ID: {transaction.id}</p>
      <p>From: {transaction.inputMap.address}</p>
      <div>
        <h4>Recipients:</h4>
        <ul>
          {Object.entries(transaction.outputMap).map(([recipient, amount], i) => (
            <li key={i}>
              <p>To: {recipient}</p>
              <p>Amount: {amount}</p>
            </li>
          ))}
        </ul>
      </div>
      <p>Timestamp: {new Date(transaction.inputMap.timestamp).toLocaleString()}</p>
    </div>
    ));
  };

  return (
    <div className="blockchain-page">
      <h1>Blockchain</h1>
        <Tabs>
          <TabList>
            <Tab>Fetch Blockchain</Tab>
            <Tab>Mine Block</Tab>
            <Tab>Transactions</Tab>
            <Tab>Comming Soon</Tab>
          </TabList>
        
          <TabPanel>
            <h2>Fetching Blockchain</h2>
            {renderBlockchainData()}
          </TabPanel>
          <TabPanel>
            <h2>Mine Block</h2>
            <button onClick={mineBlock}>Mine Block</button>
            <p>{miningStatus}</p>
          </TabPanel>
          <TabPanel>
            <h2>Transactions</h2>
            {renderTransactions()}
          </TabPanel>
          <TabPanel>
            <h2>More Features Coming Soon</h2>
            <p>We're currently working on something awesome. Stay tuned!</p>
          </TabPanel>
        </Tabs>
    </div>
  );
};

export default Blockchain;
