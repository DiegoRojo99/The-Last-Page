#!/usr/bin/env node

/**
 * One-off Firestore cleanup script for removing users/{uid}/books/{bookId}/readingSessions docs.
 *
 * Usage:
 *   npm run cleanup:reading-sessions
 *   npm run cleanup:reading-sessions -- --execute
 *   npm run cleanup:reading-sessions -- --execute --user <uid>
 */

const { loadEnvConfig } = require('@next/env');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const HELP_TEXT = `
Delete readingSessions subcollection documents from Firestore.

Options:
  --execute        Actually delete data. Without this flag the script runs in dry-run mode.
  --user <uid>     Limit deletion to one user ID.
  --help           Show this help.

Examples:
  npm run cleanup:reading-sessions
  npm run cleanup:reading-sessions -- --execute
  npm run cleanup:reading-sessions -- --execute --user abc123
`.trim();

function parseArgs(argv) {
  const args = {
    execute: false,
    userId: null,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--execute') {
      args.execute = true;
      continue;
    }
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }
    if (token === '--user') {
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        throw new Error('Missing value for --user');
      }
      args.userId = value;
      i += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${token}`);
  }

  return args;
}

function initFirestore() {
  loadEnvConfig(process.cwd());

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your environment.'
    );
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  return getFirestore();
}

async function deleteReadingSessions({ db, execute, userId }) {
  const sessionsSnapshot = await db.collectionGroup('readingSessions').get();

  const usersScanned = new Set();
  const booksScanned = new Set();
  let sessionsFound = 0;
  let skippedOutsideTargetPath = 0;

  const writer = execute ? db.bulkWriter() : null;

  for (const sessionDoc of sessionsSnapshot.docs) {
    // Only target users/{uid}/books/{bookId}/readingSessions/{sessionId}
    const pathSegments = sessionDoc.ref.path.split('/');
    const isExpectedPath =
      pathSegments.length === 6 &&
      pathSegments[0] === 'users' &&
      pathSegments[2] === 'books' &&
      pathSegments[4] === 'readingSessions';

    if (!isExpectedPath) {
      skippedOutsideTargetPath += 1;
      continue;
    }

    const currentUserId = pathSegments[1];
    const currentBookId = pathSegments[3];

    if (userId && currentUserId !== userId) {
      continue;
    }

    usersScanned.add(currentUserId);
    booksScanned.add(`${currentUserId}/${currentBookId}`);
    sessionsFound += 1;

    if (execute && writer) {
      writer.delete(sessionDoc.ref);
    }
  }

  if (execute && writer) {
    await writer.close();
  }

  return {
    usersScanned: usersScanned.size,
    booksScanned: booksScanned.size,
    sessionsFound,
    skippedOutsideTargetPath,
    deleted: execute ? sessionsFound : 0,
    dryRun: !execute,
  };
}

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));

    if (args.help) {
      console.log(HELP_TEXT);
      return;
    }

    const db = initFirestore();

    console.log(args.execute ? 'Mode: EXECUTE (will delete data)' : 'Mode: DRY RUN (no data deleted)');
    if (args.userId) {
      console.log(`Scope: user ${args.userId}`);
    } else {
      console.log('Scope: all users');
    }

    const result = await deleteReadingSessions({
      db,
      execute: args.execute,
      userId: args.userId,
    });

    console.log('--- Summary ---');
    console.log(`Users scanned: ${result.usersScanned}`);
    console.log(`Books scanned: ${result.booksScanned}`);
    console.log(`Session docs found: ${result.sessionsFound}`);
    console.log(`Outside target path skipped: ${result.skippedOutsideTargetPath}`);
    console.log(`Session docs deleted: ${result.deleted}`);

    if (result.dryRun) {
      console.log('Dry run complete. Re-run with --execute to delete.');
    }
  } catch (error) {
    console.error('Cleanup failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

void main();
