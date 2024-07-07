// Blockchain.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

const Blockchain = () => {
  const [blockchainData, setBlockchainData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlockchainData();
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

  const renderBlockchainData = () => {
    if (loading) return <p>Loading blockchain data...</p>;
    if (error) return <p>{error}</p>;
    if (blockchainData.length === 0) return <p>No blockchain data found</p>;

    return blockchainData.map((block, index) => (
      <div key={index} className="block">
        <h3>Block {index}</h3>
        <p>Hash: {block.hash}</p>
        <p>Previous Hash: {block.previousHash}</p>
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

  return (
    <div className="blockchain-page">
      <h1>Blockchain</h1>
        <Tabs>
          <TabList>
            <Tab>Fetch Blockchain</Tab>
            <Tab>Mine Block</Tab>
            <Tab>Comming Soon</Tab>
          </TabList>
        
          <TabPanel>
            <h2>Fetching Blockchain</h2>
            {renderBlockchainData()}
          </TabPanel>
          <TabPanel>
            <h2>Mine Block</h2>
            <button>Mine Block</button>
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
