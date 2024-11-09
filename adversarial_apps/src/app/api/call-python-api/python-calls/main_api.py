# File: /scripts/your_script.py
import json
import sys

def your_function(input_data):
    # Process the JSON data received from stdin
    message = f"Received name: {input_data.get('name')}, age: {input_data.get('age')}"
    return {"status": "success", "message": message}

if __name__ == "__main__":
    # Read JSON data from stdin
    input_data = json.load(sys.stdin)

    # Process the input data
    result = your_function(input_data)
    
    # Print the result as a JSON string (this becomes stdout)
    print(json.dumps(result))
