import pandas as pd
import json

# Input CSV file name
csv_file = 'pub_database.csv'

# Output JSON file name
json_file = 'pubs.json'

# Read the CSV into a DataFrame
df = pd.read_csv(csv_file)

# Convert the DataFrame to JSON format (list of dicts)
pubs_json = df.to_dict(orient='records')

# Ensure new columns are included in the JSON
for pub in pubs_json:
    pub['serves_food'] = pub.get('serves_food', False)
    pub['has_pool_table'] = pub.get('has_pool_table', False)
    pub['has_darts'] = pub.get('has_darts', False)

# Write the JSON to a file
with open(json_file, 'w') as f:
    json.dump(pubs_json, f, indent=4)

print(f"✅ Successfully converted '{csv_file}' to '{json_file}'")
