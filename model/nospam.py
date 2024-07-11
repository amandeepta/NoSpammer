import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, classification_report
import xgboost as xgb
import joblib

# Load the data
mail_data = pd.read_csv('email.csv', encoding='ISO-8859-1')

# Check for missing values
missing = mail_data.isnull().sum()
print(missing)

# Replace 'spam' with 1 and 'ham' with 0
mail_data.loc[mail_data['v1'] == 'spam', 'v1'] = 1
mail_data.loc[mail_data['v1'] == 'ham', 'v1'] = 0

# Extract features and labels
X = mail_data['v2']
Y = mail_data['v1'].astype('int')

# Split the dataset into training and testing sets
X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, random_state=3)

# Vectorize the text data
vectorizer = TfidfVectorizer(min_df=1, stop_words='english', lowercase=True)
X_train_features = vectorizer.fit_transform(X_train)
X_test_features = vectorizer.transform(X_test)

# Create and train the XGBoost model
model = xgb.XGBClassifier(eval_metric='logloss')
model.fit(X_train_features, Y_train)

# Evaluate the model on the test data
predictions_on_test_data = model.predict(X_test_features)
accuracy_on_test_data = accuracy_score(Y_test, predictions_on_test_data)
print('Accuracy on test data:', accuracy_on_test_data)

# Print classification report for detailed metrics
print(classification_report(Y_test, predictions_on_test_data))

# Save the model and vectorizer
joblib.dump(model, "model.pkl")
joblib.dump(vectorizer, "vectoriser.pkl")
