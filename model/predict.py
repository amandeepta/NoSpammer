import joblib

# Load model from file
model = joblib.load('./model.pkl')
vectorizer = joblib.load('./vectoriser.pkl')

# Example function to make predictions
def predict(input_data):
    try:
        # Perform preprocessing or transformations needed
        transformed_data = vectorizer.transform(input_data)

        # Make predictions using the loaded model
        predictions = model.predict(transformed_data)
        return predictions.tolist()  # Convert predictions to list if needed
    except Exception as e:
        print(f"Prediction error: {e}")
        return None  # Handle error gracefully, return appropriate response