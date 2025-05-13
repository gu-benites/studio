# Essential Oils Semantic Search Setup

This document explains how to set up the semantic search functionality for essential oils in your application.

## Overview

The application now includes an AI-powered semantic search feature that uses OpenAI's embeddings API to find relevant essential oils based on meaning rather than just keyword matching. This enables more intuitive searches like "relaxing oils" or "oils for inflammation" even when those exact words aren't in the oil descriptions.

## Setup Requirements

To enable semantic search, you need to:

1. Set up an OpenAI API key
2. Configure the environment variable in your application

### Step 1: Obtain an OpenAI API Key

If you don't already have an OpenAI API key:

1. Go to [OpenAI's platform](https://platform.openai.com/signup)
2. Create an account or sign in
3. Navigate to the API Keys section
4. Create a new API key

### Step 2: Configure Your Application

Create or modify the `.env.local` file in the root of your project with the following content:

```
OPENAI_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with the API key you obtained from OpenAI.

### Step 3: Restart Your Development Server

After adding the environment variable, restart your development server for the changes to take effect:

```bash
npm run dev
# or
yarn dev
```

## Usage

Once configured, you can use the "AI Search" toggle in the essential oils admin interface to switch between standard text search and AI-powered semantic search.

### Troubleshooting

If semantic search isn't working:

1. Check that you've correctly set up the `OPENAI_API_KEY` environment variable
2. Ensure your OpenAI account has available credits
3. Check the browser console for any API-related errors

## Costs

The semantic search feature uses OpenAI's `text-embedding-3-small` model, which is one of their most cost-effective embedding models. Each search query consumes a small amount of API credits, with costs typically less than $0.0001 per search.
