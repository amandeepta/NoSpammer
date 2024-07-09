import joblib
import json
import sys

# Load the pre-trained model and vectorizer
model = joblib.load('../model/model.pkl')
vectorizer = joblib.load('../model/vectoriser.pkl')

def predict(input_data):
    try:
        # Extract the snippets from input data
        snippets = [email['snippet'] for email in input_data]
        transformed_data = vectorizer.transform(snippets)
        predictions = model.predict(transformed_data)
        return predictions.tolist()  # Convert numpy array to list before returning
    except Exception as e:
        print(f"Prediction error: {e}", file=sys.stderr)
        return []

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python predict.py <input_json_file>", file=sys.stderr)
        sys.exit(1)

    input_file = sys.argv[1]

    try:
        with open(input_file, 'r', encoding='utf-8') as f:  # Specify UTF-8 encoding
            email_data = json.load(f)
    except Exception as e:
        print(f"Error reading input file: {e}", file=sys.stderr)
        sys.exit(1)
    
    predictions = predict(email_data)
    for prediction in predictions:
        print(prediction)
