import sys
import json
import pandas as pd
from prophet import Prophet

data = json.loads(sys.stdin.read())
df = pd.DataFrame(data)
df['ds'] = pd.to_datetime(df['ds'])
df['y'] = df['y'].astype(float)

model = Prophet()
model.fit(df)

future = model.make_future_dataframe(periods=1, freq='MS')
forecast = model.predict(future)
next_month = forecast.iloc[-1]['yhat']

print(json.dumps({'prediction': float(next_month)}))