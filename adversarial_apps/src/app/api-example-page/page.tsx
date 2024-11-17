// File: /src/app/page.tsx
"use client";

import { useState } from 'react';

export default function HomePage() {
  const [result, setResult] = useState(null);

  const sendDataToPython = async () => {
    const data = { action: "generate_report", cik_number: "0000069499" };
    try {
      const response = await fetch('/api/call-python-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      setResult(result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1>Run Python Script</h1>
      <button onClick={sendDataToPython}>Send Data to Python</button>
      <div>Result: {result && JSON.stringify(result)}</div>
    </div>
  );
}
