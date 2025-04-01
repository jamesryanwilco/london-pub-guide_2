# London Pub Guide

The **London Pub Guide** is a web application that helps users explore and discover pubs in London. It features an interactive map, filters, and a favorites system to enhance the user experience.

## Features

- Interactive map powered by **Mapbox**.
- Firebase integration for user authentication and data storage.
- Filters for dog-friendly pubs, beer gardens, historic pubs, and more.
- Favorites system to save and manage your favorite pubs.
- Leaderboard to showcase the most popular pubs among users.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Map**: Mapbox GL JS
- **Backend**: Firebase (Firestore, Authentication)
- **Data**: JSON and CSV for pub information
- **Styling**: Custom CSS

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Pub Map
   ```

2. Install dependencies:
   - Ensure you have a modern browser and a local server (e.g., VS Code Live Server or Python's `http.server`).

3. Configure environment variables:
   - Update the `config/.env` file with your Mapbox and Firebase credentials.

4. Run the application:
   - Open `index.html` in a browser or serve the project using a local server.

## Firebase Configuration

Ensure you have a Firebase project set up. Update the `static/firebase-config.js` file with your Firebase credentials.

## Mapbox Configuration

Replace the `MAPBOX_ACCESS_TOKEN` in `config/tokens.js` with your Mapbox API key.

## Data Conversion

To convert the CSV data to JSON, use the provided Python script:
```bash
cd data
python CSV_to_JSON.py
```

## Folder Structure

```
Pub Map/
├── config/
│   ├── firebase-config.js
│   ├── tokens.js
├── data/
│   ├── pub_database.csv
│   ├── pubs.json
│   ├── CSV_to_JSON.py
├── static/
│   ├── styles/
│   ├── auth.js
│   ├── favourites.js
│   ├── filters.js
│   ├── leaderboard.js
│   ├── main.js
│   ├── map.js
│   ├── markers.js
│   ├── sidebar.js
├── index.html
└── README.md
```

## License

This project is licensed under the MIT License. See `LICENSE` for details.
# london-pub-guide_2
