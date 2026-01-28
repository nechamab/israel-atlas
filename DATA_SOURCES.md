# Data Sources Documentation

## 1. Neighborhood Boundaries
- **Endpoint:** `/api/neighborhoods`
- **Format:** GeoJSON
- **Status:** Active
- **Language Considerations:** English, Hebrew
- **Data Cross-References:** 
  - Synagogue locations (linked via neighborhood ID)
  - Yeshiva locations (linked via neighborhood ID)

## 2. Street Network
- **Endpoint:** `/api/streets`
- **Format:** GeoJSON
- **Status:** Active
- **Language Considerations:** English, Hebrew
- **Data Cross-References:** 
  - Synagogue locations (linked via street ID)
  - Neighborhood boundaries (for contextual mapping)

## 3. Synagogue Locations
- **Endpoint:** `/api/synagogues`
- **Format:** GeoJSON
- **Status:** Active
- **Language Considerations:** English, Hebrew
- **Data Cross-References:** 
  - Neighborhood boundaries (linked via neighborhood ID)
  - Street network (to provide location details)

## 4. Yeshiva Locations
- **Endpoint:** `/api/yeshivas`
- **Format:** GeoJSON
- **Status:** Active
- **Language Considerations:** English, Hebrew
- **Data Cross-References:** 
  - Neighborhood boundaries (linked via neighborhood ID)
  - Street network (to provide geographic context)