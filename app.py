from flask import Flask, render_template, request, jsonify
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import pandas as pd
from sklearn.linear_model import LinearRegression

app = Flask(__name__)

# Load dataset
df = pd.read_csv('laptops_raw.csv')
df = df.dropna().copy()

# Convert price to numeric
kurs_inr_to_idr = 190

# Samakan format teks
df['processor_brand'] = df['processor_brand'].str.lower().str.strip()
df['processor_tier'] = df['processor_tier'].str.lower().str.strip()
df['gpu_type'] = df['gpu_type'].str.lower().str.strip()

# Ambil hanya Intel dan AMD
df = df[df['processor_brand'].isin(['intel', 'amd'])].copy()

# Mapping tier processor ke score angka
tier_map = {
    'core i3': 3,
    'ryzen 3': 3,
    'core i5': 5,
    'ryzen 5': 5,
    'core i7': 7,
    'ryzen 7': 7
}

# Ambil hanya tier 3, 7, dan 9
df['processor_tier_score'] = df['processor_tier'].map(tier_map)
df = df[df['processor_tier_score'].notna()].copy()

# Mapping GPU type
gpu_map = {
    'integrated': 0,
    'dedicated': 1
}

df['gpu_type_score'] = df['gpu_type'].map(gpu_map)
df = df[df['gpu_type_score'].notna()].copy()

# One-hot encode processor brand saja
df = pd.get_dummies(df, columns=['processor_brand'], drop_first=True)

features = [
    'processor_tier_score',
    'num_cores',
    'num_threads',
    'ram_memory',
    'primary_storage_capacity',
    'gpu_type_score',
    'display_size'
]

# Tambahkan kolom one-hot brand
brand_features = [col for col in df.columns if col.startswith('processor_brand_')]
features.extend(brand_features)

X = df[features]
y = df['Price']

model = LinearRegression()
model.fit(X, y)

# Store feature columns for prediction
feature_columns = X.columns.tolist()

# Compute evaluation metrics on training data
y_pred = model.predict(X)
mse = mean_squared_error(y, y_pred)
mae = mean_absolute_error(y, y_pred)
r2 = r2_score(y, y_pred)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():

    data = request.json

    processor_brand = data['processor_brand'].lower().strip()
    processor_tier = data['processor_tier'].lower().strip()
    gpu_type = data['gpu_type'].lower().strip()

    if processor_brand not in ['intel', 'amd']:
        return jsonify({
            'error': 'Processor brand hanya boleh intel atau amd'
        }), 400

    if processor_tier not in tier_map:
        return jsonify({
            'error': 'Processor tier hanya boleh Core/Ryzen 3, 7, atau 9'
        }), 400

    if gpu_type not in gpu_map:
        return jsonify({
            'error': 'GPU type hanya boleh integrated atau dedicated'
        }), 400

    # Build input vector with zeros for all features
    input_dict = dict.fromkeys(feature_columns, 0)

    # Numeric features
    input_dict['processor_tier_score'] = tier_map[processor_tier]
    input_dict['num_cores'] = int(data['num_cores'])
    input_dict['num_threads'] = int(data['num_threads'])
    input_dict['ram_memory'] = int(data['ram_memory'])
    input_dict['primary_storage_capacity'] = int(data['storage'])
    input_dict['gpu_type_score'] = gpu_map[gpu_type]
    input_dict['display_size'] = float(data['display_size'])

    # One-hot processor brand
    brand_col = f'processor_brand_{processor_brand}'
    if brand_col in input_dict:
        input_dict[brand_col] = 1

    new_data = pd.DataFrame([input_dict])

    prediction = model.predict(new_data)

    price_inr = prediction[0]
    price_idr = price_inr * kurs_inr_to_idr

    return jsonify({
        'predicted_price': round(price_idr, 0),
        'mse': round(mse, 2),
        'mae': round(mae, 2),
        'r2': round(r2, 4)
    })

if __name__ == '__main__':
    app.run(debug=True)
