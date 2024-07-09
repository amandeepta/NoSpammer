
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

mail_data = pd.read_csv('email.csv', encoding='ISO-8859-1')
print(mail_data)

missing = mail_data.isnull().sum()
print(missing)

mail_data.loc[mail_data['label'] == 'spam', 'label',] = 1
mail_data.loc[mail_data['label'] == 'ham', 'label',] = 0

print(mail_data)

X = mail_data['text']
Y = mail_data['label']

print(X)

print(Y)

X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, random_state=3)

print(X.shape)
print(X_train.shape)
print(X_test.shape)

features = TfidfVectorizer(min_df=1, stop_words='english', lowercase=True)
X_train_features = features.fit_transform(X_train)
X_test_features = features.transform(X_test)

Y_train = Y_train.astype('int')
Y_test = Y_test.astype('int')

print(X_train_features)

print(X_train)

model = LogisticRegression()

model.fit(X_train_features, Y_train)

prediction_on_training_data = model.predict(X_train_features)
accuracy_on_training_data = accuracy_score(Y_train, prediction_on_training_data)

print('Accuracy on training data : ', accuracy_on_training_data)
predict = model.predict(X_test_features)
accuracy_on_test = accuracy_score(Y_test, predict)
print("predict", accuracy_on_test)
import joblib

joblib.dump(model, "model.pkl")
joblib.dump(features, "vectoriser.pkl")

