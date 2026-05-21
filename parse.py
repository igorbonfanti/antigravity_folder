import pandas as pd
import json

def main():
    try:
        df = pd.read_excel('kerakoll_listino-gen-ita-nov2025.xlsx')
        df = df.dropna(how='all')
        
        # Take the first ~50 valid rows to examine
        sample = df.head(50)
        
        # We need to sanitize keys (columns)
        cols = list(sample.columns)
        
        data = sample.to_dict(orient='records')
        
        with open('products_sample.json', 'w', encoding='utf-8') as f:
            json.dump({
                'columns': [str(c) for c in cols],
                'data': data
            }, f, indent=2, default=str)
            
        print("Success: products_sample.json created")
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    main()
