# Development Workflow

This document outlines the development workflow for the Israel Atlas project, detailing the steps to fetch municipal REST services, convert Yeshiva CSV files to GeoJSON, handle Hebrew encoding, combine multiple data layers, and validation procedures.

## 1. Fetching Municipal REST Services
   - Use the provided API endpoints to retrieve municipal data.
   - Ensure that the requests are authenticated if necessary.
   - Utilize tools like Postman or curl for testing the endpoints.

## 2. Converting Yeshiva CSV to GeoJSON
   - Read the Yeshiva CSV file using a data processing library (e.g., `pandas` in Python).
   - Transform the data into GeoJSON format by creating geometry objects for the required fields.
   - Example code snippet:
     ```python
     import pandas as pd
     from shapely.geometry import Point
     import geojson

     df = pd.read_csv('yeshiva_data.csv')
     features = []
     for _, row in df.iterrows():
         point = Point(row['longitude'], row['latitude'])
         features.append(geojson.Feature(geometry=point, properties=row.to_dict()))
     feature_collection = geojson.FeatureCollection(features)
     with open('yeshiva_data.geojson', 'w') as f:
         geojson.dump(feature_collection, f)
     ```

## 3. Handling Hebrew Encoding
   - Ensure that all text files containing Hebrew characters are encoded in UTF-8.
   - Use appropriate methods to read and write files using this encoding to avoid data corruption.
   - Example: `open('file.txt', 'r', encoding='utf-8')`

## 4. Combining Multiple Data Layers
   - Use GIS tools or libraries (e.g., `GeoPandas`) to merge different GeoJSON layers.
   - Ensure that the coordinate reference systems match for all layers before combining.
   - Example code:
     ```python
     import geopandas as gpd
     layer1 = gpd.read_file('layer1.geojson')
     layer2 = gpd.read_file('layer2.geojson')
     combined = gpd.overlay(layer1, layer2, how='union')
     combined.to_file('combined_layer.geojson', driver='GeoJSON')
     ```

## 5. Validation Procedures
   - Implement validation checks to ensure data integrity and accuracy.
   - Use libraries like `PyGeoValidation` to run geographic validations.
   - Document the validation results and address any discrepancies.

---

This workflow is intended to streamline the development process and ensure efficient data handling throughout the project.