import 'openai/shims/node';
import { generateEmbedding } from '@/lib/openai/services/embeddings';
import * as fs from 'fs';
import * as path from 'path';

describe('Embedding Generation', () => {
  const testTerm = 'lavaandaer';
  const outputDir = path.join(__dirname, 'test-outputs');
  const outputFile = path.join(outputDir, 'embedding-test-result.txt');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Helper function to write to file and console
  const log = (message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(outputFile, logMessage, 'utf-8');
    console.log(message);
  };

  it('should generate an embedding for a single term', async () => {
    // Clear previous output file
    if (fs.existsSync(outputFile)) {
      fs.writeFileSync(outputFile, '', 'utf-8');
    }

    log('🚀 Starting embedding generation test...');
    log(`🔍 Test term: "${testTerm}"`);
    
    try {
      log('🔄 Generating embedding...');
      const response = await generateEmbedding(testTerm);
      
      // Log the response for debugging
      log('✅ Embedding generated successfully!');
      log(`📊 Model used: ${response.model}`);
      log(`📏 Vector dimensions: ${response.embedding.length}`);
      log(`🔢 First 5 values: [${response.embedding.slice(0, 5).join(', ')}]`);
      log(`📝 Usage - Prompt tokens: ${response.usage.promptTokens}, Total tokens: ${response.usage.totalTokens}`);
      
      // Write the full embedding to a separate file
      const embeddingFile = path.join(outputDir, 'embedding-vector.json');
      fs.writeFileSync(embeddingFile, JSON.stringify({
        model: response.model,
        dimensions: response.embedding.length,
        usage: response.usage,
        first5: response.embedding.slice(0, 5),
        embedding: response.embedding
      }, null, 2));
      
      log(`💾 Full embedding vector saved to: ${embeddingFile}`);
      
      // Basic validation
      log('🧪 Running assertions...');
      expect(response).toBeDefined();
      expect(response.embedding).toBeInstanceOf(Array);
      
      // Check the embedding dimensions (text-embedding-3-small has 1536 dimensions)
      const expectedDimensions = 1536;
      expect(response.embedding.length).toBe(expectedDimensions);
      
      // Check the model used
      expect(response.model).toBe('text-embedding-3-small');
      
      // Check token usage
      expect(response.usage.promptTokens).toBeGreaterThan(0);
      expect(response.usage.totalTokens).toBeGreaterThan(0);
      
      log('🎉 All tests passed!');
    } catch (error) {
      const errorMessage = `❌ Test failed with error: ${error instanceof Error ? error.message : String(error)}`;
      log(errorMessage);
      if (error instanceof Error && error.stack) {
        log('Stack trace:');
        log(error.stack);
      }
      throw error; // Re-throw to fail the test
    }
  });
});
