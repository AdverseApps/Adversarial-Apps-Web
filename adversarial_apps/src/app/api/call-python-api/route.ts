// File: /src/app/api/run-python/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming JSON data from the request
    const inputActionAndData = await req.json();

    // Path to the Python script
    const scriptPath = `${process.cwd()}/src/app/api/call-python-api/python-calls/main_api.py`;
    
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
      console.error('Python script error:', stderr);
      return NextResponse.json({ error: stderr }, { status: 500 });
    }

    // Parse and return the Python script's output
    const data = JSON.parse(stdout); // Ensure that stdout contains valid JSON
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Execution error:', error);
    return NextResponse.json({ error: 'An error occurred while executing the script' }, { status: 500 });
  }
}
