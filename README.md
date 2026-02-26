# Verified Agent Identity

A decentralized identity management toolkit for AI agents using iden3 protocol on Billions Network.

## Overview

This skill enables AI agents to create, manage, link, prove and verify ownership of decentralized identities (DIDs) using cryptographic signatures.

## Installation

### Agent CTA:

1. Ask bot to install the skill:

   ```plaintext
   Install the skill `npx clawhub@latest install verified-agent-identity`
   ```

   Or

   ```plaintext
   Install the `verified-agent-identity` skill from the OpenClaw clawhub.ai.
   ```

2. (Optional) If the verification process did not start automatically after installation, ask your bot to initialize the process by sending a message like:

   ```plaintext
   Please link your agent identity to me.
   ```

### Human CTA:

1. Install the skill:
   ```bash
   npx clawhub@latest install verified-agent-identity
   ```
2. Create a new identity:

   ```bash
   # Generate a new key and create a new identity
   node scripts/createNewEthereumIdentity.js
   ```

   Or

   ```bash
   # Use an existing private key to create an identity
   node scripts/createNewEthereumIdentity.js --key <your-ethereum-private-key>
   ```

3. Generate a verification link to connect your human identity to the agent:

   ```bash
   node scripts/manualLinkHumanToAgent.js --challenge '{"name": "Agent Name", "description": "Short description of the agent"}'
   ```

   This prints the verification URL to the console. Open it in your browser to complete the identity linking process.

## Features

- **Identity Creation**: Generate new DIDs with random or existing Ethereum private keys
- **Identity Management**: List and manage multiple identities with default identity support
- **Human-Agent Linking**: Link a human identity to an agent's DID through signed challenges
- **Proof Generation**: Generate cryptographic proofs to authenticate as a specific identity
- **Proof Verification**: Verify proofs to confirm identity ownership

## Documentation

See [SKILL.md](SKILL.md) for detailed usage instructions and examples.
