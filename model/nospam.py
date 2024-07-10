import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Load the data
mail_data = pd.read_csv('email.csv', encoding='ISO-8859-1')
print(mail_data)

# Check for missing values
missing = mail_data.isnull().sum()
print(missing)

# Replace 'spam' with 1 and 'ham' with 0
mail_data.loc[mail_data['v1'] == 'spam', 'v1'] = 1
mail_data.loc[mail_data['v1'] == 'ham', 'v1'] = 0

print(mail_data)

# Extract features and labels
X = mail_data['v2']
Y = mail_data['v1'].astype('int')

print(X)
print(Y)

# Split the dataset into training and testing sets
X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, random_state=3)

print(X.shape)
print(X_train.shape)
print(X_test.shape)

# Vectorize the text data
features = TfidfVectorizer(min_df=1, stop_words='english', lowercase=True)
X_train_features = features.fit_transform(X_train)
X_test_features = features.transform(X_test)

# Create and train the Logistic Regression model with class weights
model = LogisticRegression(class_weight='balanced')
model.fit(X_train_features, Y_train)

# Evaluate the model on the training data
prediction_on_training_data = model.predict(X_train_features)
accuracy_on_training_data = accuracy_score(Y_train, prediction_on_training_data)
print('Accuracy on training data:', accuracy_on_training_data)

# Evaluate the model on the test data
predictions_on_test_data = model.predict(X_test_features)
accuracy_on_test_data = accuracy_score(Y_test, predictions_on_test_data)
print('Accuracy on test data:', accuracy_on_test_data)

# Print classification report for detailed metrics
print(classification_report(Y_test, predictions_on_test_data))

# Save the model and vectorizer
joblib.dump(model, "model.pkl")
joblib.dump(features, "vectoriser.pkl")
