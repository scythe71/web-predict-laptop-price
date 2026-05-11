from flask import Flask, render_template, request, jsonify
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder

app = Flask(__name__)

# Load dataset
df = pd.read_csv('laptops_raw.csv')
df = df.dropna().copy()

# Convert price to numeric
kurs_inr_to_idr = 190

# Encoder
le_processor_brand = LabelEncoder()
le_processor_tier = LabelEncoder()
le_gpu_type = LabelEncoder()

df['processor_brand'] = le_processor_brand.fit_transform(df['processor_brand'])
df['processor_tier'] = le_processor_tier.fit_transform(df['processor_tier'])
df['gpu_type'] = le_gpu_type.fit_transform(df['gpu_type'])

features = [
    'processor_brand',
    'processor_tier',
    'num_cores',
    'num_threads',
    'ram_memory',
    'primary_storage_capacity',
    'gpu_type',
    'display_size'
]

X = df[features]
y = df['Price']

model = LinearRegression()
model.fit(X, y)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():

    data = request.json

    new_data = pd.DataFrame({
        'processor_brand': le_processor_brand.transform([data['processor_brand']]),
        'processor_tier': le_processor_tier.transform([data['processor_tier']]),
        'num_cores': [int(data['num_cores'])],
        'num_threads': [int(data['num_threads'])],
        'ram_memory': [int(data['ram_memory'])],
        'primary_storage_capacity': [int(data['storage'])],
        'gpu_type': le_gpu_type.transform([data['gpu_type']]),
        'display_size': [float(data['display_size'])]
    })

    prediction = model.predict(new_data)

    price_inr = prediction[0]

    price_idr = price_inr * kurs_inr_to_idr

    return jsonify({
        'predicted_price': round(price_idr, 0)
    })

if __name__ == '__main__':
    app.run(debug=True)

