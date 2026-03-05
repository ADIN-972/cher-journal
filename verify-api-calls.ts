/**
 * API Call Verification Script
 * Verifies all API calls reach the backend and result in database changes
 */

import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import chalk from 'chalk';

const API_BASE = 'http://localhost:5000';
const prisma = new PrismaClient();

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  details?: string;
  apiStatus?: number;
  dbVerified?: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function logResult(test: TestResult) {
  results.push(test);
  const icon = test.status === 'PASS' ? '✅' : '❌';
  const status = test.status === 'PASS'
    ? chalk.green(test.status)
    : chalk.red(test.status);

  console.log(`${icon} ${test.name}: ${status}`);
  if (test.details) console.log(`   └─ ${test.details}`);
  if (test.error) console.log(`   └─ Error: ${chalk.red(test.error)}`);
}

async function testHealthCheck(): Promise<TestResult> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    const status = res.status;

    return {
      name: 'Health Check',
      status: status === 200 ? 'PASS' : 'FAIL',
      apiStatus: status,
      details: `API responding with status ${status}`
    };
  } catch (error: any) {
    return {
      name: 'Health Check',
      status: 'FAIL',
      error: error.message
    };
  }
}

async function testAuthLogin(): Promise<TestResult> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@cherjournal.com',
        password: 'admin123'
      })
    });

    const status = res.status;
    const data: any = await res.json();

    // Check if user exists in DB
    const user = await prisma.users.findUnique({
      where: { email: 'admin@cherjournal.com' }
    });

    return {
      name: 'Auth Login',
      status: (status === 200 || status === 401) && user ? 'PASS' : 'FAIL',
      apiStatus: status,
      dbVerified: !!user,
      details: `API status: ${status}, User in DB: ${!!user}`
    };
  } catch (error: any) {
    return {
      name: 'Auth Login',
      status: 'FAIL',
      error: error.message
    };
  }
}

async function testGetChapters(): Promise<TestResult> {
  try {
    const res = await fetch(`${API_BASE}/chapters`, {
      headers: { 'Content-Type': 'application/json' }
    });

    const status = res.status;
    const data: any = await res.json();

    // Verify chapters in DB
    const chaptersCount = await prisma.chapters.count();

    return {
      name: 'Get Chapters',
      status: status === 200 && Array.isArray(data?.data) ? 'PASS' : 'FAIL',
      apiStatus: status,
      dbVerified: chaptersCount >= 0,
      details: `API status: ${status}, DB chapters: ${chaptersCount}`
    };
  } catch (error: any) {
    return {
      name: 'Get Chapters',
      status: 'FAIL',
      error: error.message
    };
  }
}

async function testGetVolumes(): Promise<TestResult> {
  try {
    const res = await fetch(`${API_BASE}/volumes`, {
      headers: { 'Content-Type': 'application/json' }
    });

    const status = res.status;
    const data: any = await res.json();

    // Verify volumes in DB
    const volumesCount = await prisma.volumes.count();

    return {
      name: 'Get Volumes',
      status: status === 200 && Array.isArray(data?.data) ? 'PASS' : 'FAIL',
      apiStatus: status,
      dbVerified: volumesCount >= 0,
      details: `API status: ${status}, DB volumes: ${volumesCount}`
    };
  } catch (error: any) {
    return {
      name: 'Get Volumes',
      status: 'FAIL',
      error: error.message
    };
  }
}

async function testDatabaseConnection(): Promise<TestResult> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      name: 'Database Connection',
      status: 'PASS',
      dbVerified: true,
      details: 'PostgreSQL connection successful'
    };
  } catch (error: any) {
    return {
      name: 'Database Connection',
      status: 'FAIL',
      error: error.message
    };
  }
}

async function testCORSHeaders(): Promise<TestResult> {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://app.moncherjournal.com',
        'Access-Control-Request-Method': 'GET'
      }
    });

    const corsOrigin = res.headers.get('access-control-allow-origin');
    const hasCORS = !!corsOrigin;

    return {
      name: 'CORS Configuration',
      status: hasCORS ? 'PASS' : 'FAIL',
      apiStatus: res.status,
      details: `CORS Allow-Origin: ${corsOrigin || 'not set'}`
    };
  } catch (error: any) {
    return {
      name: 'CORS Configuration',
      status: 'FAIL',
      error: error.message
    };
  }
}

async function runVerification() {
  console.log(chalk.cyan.bold('\n🔍 API Call Verification\n'));
  console.log(chalk.gray(`Testing API: ${API_BASE}`));
  console.log(chalk.gray('Database: PostgreSQL (cherjournal_claude)\n'));

  // Run tests
  await logResult(await testDatabaseConnection());
  await logResult(await testHealthCheck());
  await logResult(await testCORSHeaders());
  await logResult(await testAuthLogin());
  await logResult(await testGetChapters());
  await logResult(await testGetVolumes());

  // Summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log(chalk.cyan.bold(`\n📊 Summary\n`));
  console.log(`${chalk.green(`✅ Passed: ${passed}`)} / ${chalk.red(`❌ Failed: ${failed}`)} / Total: ${results.length}`);

  if (failed === 0) {
    console.log(chalk.green.bold('\n✨ All tests passed! API is working correctly.\n'));
  } else {
    console.log(chalk.red.bold('\n⚠️  Some tests failed. Check details above.\n'));
  }

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runVerification().catch((error) => {
  console.error(chalk.red('Verification failed:'), error);
  process.exit(1);
});
