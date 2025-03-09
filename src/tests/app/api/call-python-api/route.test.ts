/* eslint-disable @typescript-eslint/no-explicit-any */
import { POST } from '../../../../app/api/call-python-api/route';
import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

jest.mock('child_process', () => ({
  spawn: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation(() => ({
    json: jest.fn(),
  })),
  NextResponse: {
    json: jest.fn(),
  },
}));

const getCorsHeaders = () => ({
  'Access-Control-Allow-Origin': 'https://adverseapps.github.io',
  'Access-Control-Allow-Methods': 'POST',
});

describe('POST /run-python', () => {
  let mockSpawn: jest.Mock;
  let mockResponseJson: jest.SpyInstance;

  beforeEach(() => {
    mockSpawn = spawn as jest.Mock;
    mockResponseJson = jest.spyOn(NextResponse, 'json');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return the correct response when the Python script executes successfully', async () => {
    const inputData = { data: 'sample' };
    const mockRequest = {
      json: jest.fn().mockResolvedValue(inputData),
      method: 'POST',
    } as unknown as NextRequest;
    const pythonOutput = JSON.stringify({ result: 'success' });

    // Mock the request body
    (mockRequest.json as jest.Mock).mockResolvedValue(inputData);

    // Mock the child process
    const mockStdout = {
      on: jest.fn((event, callback) => {
        if (event === 'data') {
          callback(Buffer.from(pythonOutput));
        }
      }),
    };

    const mockStderr = {
      on: jest.fn(),
    };

    const mockProcess = {
      stdout: mockStdout,
      stderr: mockStderr,
      stdin: {
        write: jest.fn(),
        end: jest.fn(),
      },
      on: jest.fn((event, callback) => {
        if (event === 'close') {
          callback(0); // Simulate successful execution
        }
      }),
    };

    mockSpawn.mockReturnValue(mockProcess as any);

    // Call the POST function
    await POST(mockRequest);

    // Assertions
    expect(mockRequest.json).toHaveBeenCalledTimes(1);
    expect(mockSpawn).toHaveBeenCalledWith('python3', ['src/app/api/call-python-api/python-calls/main_api.py']);
    expect(mockProcess.stdin.write).toHaveBeenCalledWith(JSON.stringify(inputData));
    expect(mockProcess.stdin.end).toHaveBeenCalled();
    expect(mockResponseJson).toHaveBeenCalledWith(JSON.parse(pythonOutput), { status: 200, headers: getCorsHeaders(),
    });
  });

  it('should handle Python script errors (stderr)', async () => {
    const pythonError = 'Python error occurred';
    const inputData = { data: 'sample' };
    const mockRequest = {
      json: jest.fn().mockResolvedValue(inputData),
      method: 'POST',
    } as unknown as NextRequest;

    // Mock the request body
    (mockRequest.json as jest.Mock).mockResolvedValue(inputData);

    // Mock the child process
    const mockStdout = {
      on: jest.fn(),
    };

    const mockStderr = {
      on: jest.fn((event, callback) => {
        if (event === 'data') {
          callback(Buffer.from(pythonError));
        }
      }),
    };

    const mockProcess = {
      stdout: mockStdout,
      stderr: mockStderr,
      stdin: {
        write: jest.fn(),
        end: jest.fn(),
      },
      on: jest.fn((event, callback) => {
        if (event === 'close') {
          callback(0); // Simulate successful execution
        }
      }),
    };

    mockSpawn.mockReturnValue(mockProcess as any);

    // Call the POST function
    await POST(mockRequest);

    // Assertions
    expect(mockRequest.json).toHaveBeenCalledTimes(1);
    expect(mockSpawn).toHaveBeenCalledWith('python3', ['src/app/api/call-python-api/python-calls/main_api.py']);
    expect(mockProcess.stdin.write).toHaveBeenCalledWith(JSON.stringify(inputData));
    expect(mockProcess.stdin.end).toHaveBeenCalled();
    expect(mockResponseJson).toHaveBeenCalledWith({ error: pythonError }, { status: 500, headers: getCorsHeaders(),
    });
  });

  it('should handle non-zero exit codes from the Python script', async () => {
    const inputData = { data: 'sample' };
    const mockRequest = {
      json: jest.fn().mockResolvedValue(inputData),
      method: 'POST',
    } as unknown as NextRequest;
    (mockRequest.json as jest.Mock).mockResolvedValue(inputData);
    

    // Mock the child process
    const mockStdout = {
      on: jest.fn(),
    };

    const mockStderr = {
      on: jest.fn(),
    };

    const mockProcess = {
      stdout: mockStdout,
      stderr: mockStderr,
      stdin: {
        write: jest.fn(),
        end: jest.fn(),
      },
      on: jest.fn((event, callback) => {
        if (event === 'close') {
          callback(1); // Simulate non-zero exit code
        }
      }),
    };

    mockSpawn.mockReturnValue(mockProcess as any);

    // Call the POST function
    await POST(mockRequest);

    // Assertions
    expect(mockRequest.json).toHaveBeenCalledTimes(1);
    expect(mockSpawn).toHaveBeenCalledWith('python3', ['src/app/api/call-python-api/python-calls/main_api.py']);
    expect(mockProcess.stdin.write).toHaveBeenCalledWith(JSON.stringify(inputData));
    expect(mockProcess.stdin.end).toHaveBeenCalled();
    expect(mockResponseJson).toHaveBeenCalledWith(
      { error: 'An error occurred while executing the script' },
      { status: 500, headers: getCorsHeaders(),
      }
    );
  });

  it('should handle JSON parsing errors in stdout', async () => {
    const inputData = { data: 'sample' };
    const mockRequest = {
      json: jest.fn().mockResolvedValue(inputData),
      method: 'POST',
    } as unknown as NextRequest;
    const invalidJsonOutput = 'Invalid JSON output';

    // Mock the request body
    (mockRequest.json as jest.Mock).mockResolvedValue(inputData);

    // Mock the child process
    const mockStdout = {
      on: jest.fn((event, callback) => {
        if (event === 'data') {
          callback(Buffer.from(invalidJsonOutput));
        }
      }),
    };

    const mockStderr = {
      on: jest.fn(),
    };

    const mockProcess = {
      stdout: mockStdout,
      stderr: mockStderr,
      stdin: {
        write: jest.fn(),
        end: jest.fn(),
      },
      on: jest.fn((event, callback) => {
        if (event === 'close') {
          callback(0); // Simulate successful execution
        }
      }),
    };

    mockSpawn.mockReturnValue(mockProcess as any);

    // Call the POST function
    await POST(mockRequest);

    // Assertions
    expect(mockRequest.json).toHaveBeenCalledTimes(1);
    expect(mockSpawn).toHaveBeenCalledWith('python3', ['src/app/api/call-python-api/python-calls/main_api.py']);
    expect(mockProcess.stdin.write).toHaveBeenCalledWith(JSON.stringify(inputData));
    expect(mockProcess.stdin.end).toHaveBeenCalled();
    expect(mockResponseJson).toHaveBeenCalledWith(
      { error: 'An error occurred while executing the script' },
      { status: 500, headers: getCorsHeaders(),
      }
    );
  });
});
