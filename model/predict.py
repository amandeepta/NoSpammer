import joblib
model = joblib.load('../model/model.pkl')
vectorizer = joblib.load('../model/vectoriser.pkl')
input_data = ["hello there sent fromt Iphone"]
def predict(input_data):
    try:
        transformed_data = vectorizer.transform(input_data)
        predictions = model.predict(transformed_data)
        return predictions[0]
    except Exception as e:
        print("Prediction error: {e}")
        return None  # Handle error gracefully, return appropriate response
    

result = predict(input_data)
print(result)