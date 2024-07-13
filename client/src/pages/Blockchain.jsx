import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { asyncHandler } from '../utilities/asyncUtils';
import { getRandomPuzzle, checkPuzzleAnswer } from '../utilities/puzzleGenerator';
import { useUser } from '../hooks/useUser';

const Blockchain = () => {
  const [blockchainData, setBlockchainData] = useState([]);
  const [blockchainError, setBlockchainError] = useState(null);
  const [miningStatus, setMiningStatus] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [transactionError, setTransactionError] = useState(null);
  const [puzzle, setPuzzle] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const { user } = useUser();
  const [puzzleEnabled, setPuzzleEnabled] = useState(true);
  const [displayBlocks, setDisplayBlocks] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [walletInfo, setWalletInfo] = useState(null);
  const [transactionPool, setTransactionPool] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBlockchainData();
    fetchTransactions();
    fetchWalletInfo();
    fetchTransactionPool();
  }, []);

  const fetchData = asyncHandler(async (url) => {
    const response = await axios.get(url);
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    throw new Error('Unexpected data format received from server');
  });

  const fetchBlockchainData = async () => {
    try {
      const result = await fetchData('http://localhost:5001/api/v1/blockchain');
      setBlockchainData(result);
      setDisplayBlocks(result);
      setCurrentPosition(result.length - 3 >= 0 ? result.length - 3 : 0);
      setBlockchainError(null);
    } catch (error) {
      setBlockchainError('Error fetching blockchain data');
    }
  };

  const fetchTransactions = async () => {
    try {
      const result = await fetchData('http://localhost:5001/api/v1/wallet/transactions/all');
      setTransactions(result);
      setTransactionError(null);
    } catch (error) {
      setTransactionError('Error fetching transactions');
    }
  };

  const fetchWalletInfo = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/api/v1/wallet/info');
      setWalletInfo(response.data.data);
    } catch (error) {
      setTransactionError('Error fetching wallet information: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTransactionPool = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/v1/wallet/transactions');
      setTransactionPool(response.data.data);
    } catch (error) {
      setTransactionError('Error fetching transaction pool');
    }
  };

  const scrollLeft = () => {
    setCurrentPosition(prev => Math.max(prev - 1, 0));
  };

  const scrollRight = () => {
    setCurrentPosition(prev => Math.min(prev + 1, displayBlocks.length - 3));
  };

  const mineBlock = asyncHandler(async () => {
    const response = await axios.post('http://localhost:5001/api/v1/block/mine', {
      minerPublicKey: user.walletPublicKey
    });
    if (response.data.success) {
      setMiningStatus('Block mined successfully');
      await fetchBlockchainData();
      await fetchTransactions();
      await fetchWalletInfo();
      await fetchTransactionPool();
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
    if (blockchainError) return <p>{blockchainError}</p>;
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
    if (transactionError) return <p>{transactionError}</p>;
    
    return (
      <div className="transactions-container">
        <h3>Wallet Information</h3>
        {walletInfo ? (
          <div className="wallet-info">
            <p>Address: {walletInfo.address}</p>
            <p>Balance: {walletInfo.balance}</p>
          </div>
        ) : (
          <p>Loading wallet information...</p>
        )}
  
        <h3>Transaction Pool</h3>
        {transactionPool.length > 0 ? (
          transactionPool.map((transaction, index) => (
            <div key={index} className="transaction pool-transaction">
              <h4>Transaction {index + 1}</h4>
              <p>ID: {transaction.id}</p>
              <p>From: {transaction.inputMap.address}</p>
              <div>
                <h5>Recipients:</h5>
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
          ))
        ) : (
          <p>No transactions in the pool</p>
        )}
  
        <h3>Confirmed Transactions</h3>
        {transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <div key={index} className="transaction confirmed-transaction">
              <h4>Transaction {index + 1}</h4>
              <p>ID: {transaction.id}</p>
              <p>From: {transaction.inputMap.address}</p>
              <div>
                <h5>Recipients:</h5>
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
          ))
        ) : (
          <p>No confirmed transactions</p>
        )}
      </div>
    );
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