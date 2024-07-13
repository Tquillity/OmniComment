// Blockchain.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { asyncHandler } from '../utilities/asyncUtils';
import { getRandomPuzzle, checkPuzzleAnswer } from '../utilities/puzzleGenerator';
import { useUser } from '../hooks/useUser';

const Blockchain = () => {
  const [blockchainData, setBlockchainData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [miningStatus, setMiningStatus] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [puzzle, setPuzzle] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const { user } = useUser();
  const [puzzleEnabled, setPuzzleEnabled] = useState(true);
  const [displayBlocks, setDisplayBlocks] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(0);

  useEffect(() => {
    fetchBlockchainData();
    fetchTransactions();
  }, []);

  const fetchData = asyncHandler(async (url) => {
    const response = await axios.get(url);
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    throw new Error('Unexpected data format received from server');
  });

  const fetchBlockchainData = async () => {
    const result = await fetchData('http://localhost:5001/api/v1/blockchain');
    if (result.error) {
      setError('Error fetching blockchain data');
    } else {
      setBlockchainData(result);
    }
    setLoading(false);
    setDisplayBlocks(result);
    setCurrentPosition(result.length - 3 >= 0 ? result.length - 3 : 0);
  };

  const scrollLeft = () => {
    setCurrentPosition(prev => Math.max(prev - 1, 0));
  };

  const scrollRight = () => {
    setCurrentPosition(prev => Math.min(prev + 1, displayBlocks.length - 3));
  };

  const fetchTransactions = async () => {
    const result = await fetchData('http://localhost:5001/api/v1/wallet/transactions/all');
    if (result.error) {
      setError('Error fetching transactions');
    } else {
      setTransactions(result);
    }
  };

  const mineBlock = asyncHandler(async () => {
    const response = await axios.post('http://localhost:5001/api/v1/block/mine', {
      minerPublicKey: user.walletPublicKey
    });
    if (response.data.success) {
      setMiningStatus('Block mined successfully');
      await fetchBlockchainData();
    } else {
      throw new Error('Failed to mine Block.');
    }
  });

  const handleMineBlock = () => {
    if (puzzleEnabled) {
      const newPuzzle = getRandomPuzzle();
      setPuzzle(newPuzzle);
      setMiningStatus('Please solve the puzzle to mine the block');
    } else {
      mineBlock();
    }
  };

  const submitPuzzleAnswer = async () => {
    if (checkPuzzleAnswer(puzzle.question, userAnswer)) {
      setMiningStatus('Puzzle solved correctly. Mining block...');
      await mineBlock();
    } else {
      setMiningStatus('Incorrect answer. Mining failed.');
    }
    setPuzzle(null);
    setUserAnswer('');
  };

  const renderRecentBlocks = () => {
    if (displayBlocks.length === 0) {
      return <p>No blocks mined yet.</p>;
    }
  
    return displayBlocks.slice(currentPosition, currentPosition + 3).map((block, index) => (
      <div key={`${block.hash}-${index}`} className="recent-block">
        <h3>Block {currentPosition + index + 1}</h3>
        <p>Hash: {block.hash.substring(0, 10)}...</p>
        <p>Timestamp: {new Date(block.timestamp).toLocaleString()}</p>
        <p>Nonce: {block.nonce}</p>
        <p>Difficulty: {block.difficulty}</p>
        <details>
          <summary>Data ({block.data.length} items)</summary>
          <pre>{JSON.stringify(block.data, null, 2)}</pre>
        </details>
      </div>
    ));
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
          <summary>Data ({block.data.length} items)</summary>
          <pre>{JSON.stringify(block.data, null, 2)}</pre>
        </details>
      </div>
    ));
  };

  const renderTransactions = () => {
    if (transactions.length === 0) return <p>No transactions found</p>;

    return transactions.map((transaction, index) => (
      <div key={index} className="transaction">
        <h3>Transaction {index + 1}</h3>
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
    <div className="blockchain-container">
      <div className="blockchain-page">
        <h1>Blockchain</h1>
        <Tabs>
          <TabList>
            <Tab>Fetch Blockchain</Tab>
            <Tab>Mine Block</Tab>
            <Tab>Transactions</Tab>
            <Tab>Coming Soon</Tab>
          </TabList>
        
          <TabPanel>
            <h2>Fetching Blockchain</h2>
            {renderBlockchainData()}
          </TabPanel>
          <TabPanel>
            <h2>Mine Block</h2>
            <div>
              <label className="puzzle-toggle">
                <input
                  type="checkbox"
                  checked={puzzleEnabled}
                  onChange={(e) => setPuzzleEnabled(e.target.checked)}
                />
                Enable Mining Puzzle
              </label>
            </div>
            {puzzleEnabled ? (
              puzzle ? (
                <div>
                  <p>Solve this puzzle to mine the block: {puzzle.question}</p>
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter your answer"
                  />
                  <button onClick={submitPuzzleAnswer}>Submit Answer</button>
                </div>
              ) : (
                <button onClick={handleMineBlock}>Mine Block</button>
              )
            ) : (
              <button onClick={mineBlock}>Mine Block</button>
            )}
            <p>{miningStatus}</p>
            <h3>Recent Blocks</h3>           
            <div className="blocks-navigation">
              <button onClick={scrollLeft} disabled={currentPosition === 0}>
                &lt; Previous
              </button>
              <div className="recent-blocks-container">
                {renderRecentBlocks()}
              </div>
              <button onClick={scrollRight} disabled={currentPosition >= displayBlocks.length - 3}>
                Next &gt;
              </button>
            </div>
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
    </div> 
  );
};

export default Blockchain;