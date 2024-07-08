# Cryptocurrency Blockchain Project Checklist

## Core Blockchain Functionality
- [90%] Implement a complete blockchain for a custom cryptocurrency *Make sure it works in the application not only in Postman*
- [90%] Create a transaction pool to manage pending transactions *Make sure it works in the application not only in Postman*
- [90%] Implement transaction handling and validation *Make sure it works in the application not only in Postman*
- [90%] Create a "reward transaction" when a block is mined *Make sure it works in the application not only in Postman*
- [90%] Validate transactions according to rules discussed in class *Make sure it works in the application not only in Postman*

## Networking
- [90%] Enable multiple nodes to run the blockchain *Make sure it works in the application not only in Postman*
- [90%] Implement blockchain synchronization: *Make sure it works in the application not only in Postman*
  - [90%] On startup of a new node *Make sure it works in the application not only in Postman*
  - [90%] When adding transactions *Make sure it works in the application not only in Postman*
  - [90%] When a new block is created *Make sure it works in the application not only in Postman*
- [100%] Use Redis, _PubNub_, or WebSockets for network communication [VERIFIED_COMPLETE]

## Database
- [0%] Store blockchain, blocks, and transactions in MongoDB

## Security
- [100%] Implement user registration and login system [VERIFIED_COMPLETE]
- [80%] Use JSON Web Tokens (JWT) for authentication *Make sure it works in the application not only in Postman*
- [80%] Implement role-based access control for creating transactions and listing personal transactions/blocks *Make sure it works in the application not only in Postman*
- [100%] Store user information in MongoDB [VERIFIED_COMPLETE]

## Client Application
- [5%] Develop a client using React with Vite or vanilla JavaScript with HTML and CSS
- [0%] Implement functionality to create new transactions
- [0%] Create a feature to list transactions
- [80%] Implement a feature to list blocks *Some Blockchain Bugs*
- [80%] Add ability to mine new blocks with transactions *Some Blockchain Bugs*

## VG Requirements
- [95%] Implement Test-Driven Development (TDD) for transaction handling *Mostly done, go through for repitition*
- [50%] Apply Clean Code principles *Generally good but lots to do, ie moving out all security to its own middleware*
- [95%] Implement Separation of Concerns (SoC) *Double check if more can be done*
- [95%] Use Model-View-Controller (MVC) architecture *Double check if more can be done*
- [100%] Secure the server against:
  - [100%] NoSQL injections
  - [100%] DDoS attacks
  - [100%] XSS attempts
  - [100%] HPP and so on...

## Additional Tasks
- [ ] Test the entire system thoroughly
- [50%] Document the codebase and API     *Clean up addresses and bodies with more generic information*
- [ ] Create a user guide for the client application