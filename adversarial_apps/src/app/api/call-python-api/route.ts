import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import argon2 from 'argon2';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      {
        status: 405,
        headers: {
          'Access-Control-Allow-Origin': 'https://adverseapps.github.io/Adversarial-Apps-Mobile-Playground',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }

  try {
    // Parse the incoming JSON data from the request
    const inputActionAndData = await req.json();

    // Path to the Python script
    const scriptPath = 'src/app/api/call-python-api/python-calls/main_api.py';

    // checks if action is add_user, if so, hashes the password
    if (inputActionAndData.action === "add_user") {
      const password = inputActionAndData.password_hashed;
      inputActionAndData.password_hashed = await argon2.hash(password);
    }

    // Spawn a child process to run the Python script
    const pythonProcess = spawn('python3', [scriptPath]);

    let stdout = '';
    let stderr = '';

    // Collect stdout data
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    // Collect stderr data
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Pass JSON data to the Python script via stdin
    pythonProcess.stdin.write(JSON.stringify(inputActionAndData));
    pythonProcess.stdin.end();

    // Wait for the Python script to finish execution
    await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python script exited with code ${code}`));
        } else {
          resolve(null);
        }
      });
    });

    // Handle any errors from stderr
    if (stderr) {
      return NextResponse.json(
        { error: stderr },
        {
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': 'https://adverseapps.github.io/Adversarial-Apps-Mobile-Playground',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }

    // Parse and return the Python script's output
    const data = JSON.parse(stdout); // Ensure that stdout contains valid JSON
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://adverseapps.github.io/Adversarial-Apps-Mobile-Playground',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while executing the script' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': 'https://adverseapps.github.io/Adversarial-Apps-Mobile-Playground',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'https://adverseapps.github.io/Adversarial-Apps-Mobile-Playground',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
