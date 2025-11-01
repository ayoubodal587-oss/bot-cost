const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function testS3Connection() {
  console.log('\n=== Testing S3 Connection ===');
  
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.COST_REPORT_BUCKET,
      Key: process.env.COST_REPORT_KEY,
    });

    console.log(`Fetching from: ${process.env.COST_REPORT_BUCKET}/${process.env.COST_REPORT_KEY}`);
    console.log(`Region: ${process.env.AWS_REGION}`);
    
    const response = await s3Client.send(command);
    
    // Read the stream
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const text = Buffer.concat(chunks).toString('utf-8');
    const data = JSON.parse(text);
    
    console.log('✅ S3 Connection: SUCCESS');
    console.log('Data structure:', Object.keys(data));
    console.log('Daily costs entries:', data.daily_costs?.length || 0);
    console.log('Service breakdown:', Object.keys(data.service_breakdown || {}).length, 'services');
    
    if (data.daily_costs && data.daily_costs.length > 0) {
      console.log('Sample daily cost:', data.daily_costs[0]);
    }
    
    if (data.service_breakdown) {
      console.log('Sample services:', Object.keys(data.service_breakdown).slice(0, 3));
    }
    
    return data;
  } catch (error) {
    console.log('❌ S3 Connection: FAILED');
    console.log('Error:', error.message);
    return null;
  }
}

async function testGoogleAI(costData) {
  console.log('\n=== Testing Google AI API ===');
  
  if (!process.env.GOOGLE_API_KEY) {
    console.log('❌ Google AI: No API key found');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: process.env.GOOGLE_MODEL });

    console.log(`Using model: ${process.env.GOOGLE_MODEL}`);
    
    const prompt = `Analyze this AWS cost data and provide a brief summary (2-3 sentences):
Total Cost: $${costData?.totalCost || 0}
Services: ${Object.keys(costData?.service_breakdown || {}).join(', ') || 'None'}

Provide actionable insights.`;

    console.log('Sending prompt to AI...');
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    console.log('✅ Google AI: SUCCESS');
    console.log('\nAI Response:');
    console.log('---');
    console.log(text);
    console.log('---');
    
    return text;
  } catch (error) {
    console.log('❌ Google AI: FAILED');
    console.log('Error:', error.message);
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('The API key appears to be invalid or expired');
    }
    return null;
  }
}

async function main() {
  console.log('🔍 Testing Dashboard Connections\n');
  console.log('Environment variables loaded:');
  console.log('- AWS_REGION:', process.env.AWS_REGION);
  console.log('- AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✓ Set' : '✗ Missing');
  console.log('- AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✓ Set' : '✗ Missing');
  console.log('- COST_REPORT_BUCKET:', process.env.COST_REPORT_BUCKET);
  console.log('- COST_REPORT_KEY:', process.env.COST_REPORT_KEY);
  console.log('- GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? '✓ Set' : '✗ Missing');
  console.log('- GOOGLE_MODEL:', process.env.GOOGLE_MODEL);
  
  // Test S3
  const costData = await testS3Connection();
  
  // Test Google AI
  if (costData) {
    await testGoogleAI(costData);
  }
  
  console.log('\n✅ Connection test complete!\n');
}

main().catch(console.error);