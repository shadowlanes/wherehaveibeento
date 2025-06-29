# Where Have I Been To? 🌍

An interactive 3D travel visualization website built with Globe.gl that showcases countries I've visited with beautiful glowing effects, detailed statistics, and a responsive design.

![Travel Visualization](https://img.shields.io/badge/Travel-Visualization-blue)
![Globe.gl](https://img.shields.io/badge/Built%20with-Globe.gl-green)
![Responsive](https://img.shields.io/badge/Design-Responsive-orange)

## ✨ Features

- **Interactive 3D Globe**: Powered by Globe.gl with smooth auto-rotation
- **Glowing Effects**: Visited countries are highlighted with beautiful glowing rings
- **Detailed Tooltips**: Hover over countries to see visit information
- **Smart Sidebar**: Compact tiles showing:
  - Country flags
  - Number of visits
  - Total days spent
  - Visit months and years
- **Summary Statistics**: Countries visited, continents explored, and total travel days
- **Fully Responsive**: Mobile-friendly design with adaptive layouts
- **Modern Design**: Clean, warm aesthetic with beautiful typography

## 🛠️ Technology Stack

- **Frontend**: Pure HTML, CSS, and JavaScript
- **3D Visualization**: [Globe.gl](https://globe.gl/)
- **Design**: CSS Grid/Flexbox with responsive breakpoints
- **Fonts**: Poppins and Space Grotesk from Google Fonts
- **Data**: Extensible JSON structure for easy updates

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shadowlanes/wherehaveibeento.git
   cd wherehaveibeento
   ```

2. **Serve the website**:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Or use the provided script
   ./start-server.sh
   ```

3. **Open in browser**:
   Navigate to `http://localhost:8000`

## 📁 Project Structure

```
wherehaveibeento/
├── index.html              # Main HTML file
├── styles.css              # All styling and responsive design
├── start-server.sh          # Quick server start script
├── scripts/
│   ├── data.js             # Travel data and helper functions
│   ├── visualization.js    # Globe.gl setup and rendering
│   └── main.js             # Sidebar logic and app initialization
└── README.md               # This file
```

## 📊 Data Structure

The travel data is stored in `scripts/data.js` with the following structure:

```javascript
{
    name: "Country Name",
    lat: latitude,
    lng: longitude,
    flag: "🇺🇸",
    continent: "Continent Name",
    visits: [
        {
            year: 2023,
            month: "March",
            days: 7
        }
    ]
}
```

## 🎨 Customization

- **Add new countries**: Update the `travelData` array in `scripts/data.js`
- **Modify colors**: Edit the CSS custom properties in `styles.css`
- **Adjust globe settings**: Modify parameters in `scripts/visualization.js`
- **Change responsive breakpoints**: Update media queries in `styles.css`

## 📱 Responsive Design

The website is fully responsive with:
- Desktop: Side-by-side globe and sidebar layout
- Mobile: Stacked layout with globe on top, sidebar below
- Adaptive globe sizing based on screen dimensions
- Touch-friendly interface elements

## 🌟 Future Enhancements

- [ ] Add visit photos/galleries
- [ ] Flight path animations between countries
- [ ] More detailed travel statistics
- [ ] Export/share functionality
- [ ] Dark/light theme toggle
- [ ] Travel timeline view

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

---

Made with ❤️ for fellow travelers and geography enthusiasts.
