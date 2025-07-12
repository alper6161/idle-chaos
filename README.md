# Idle Chaos - RPG Equipment Management Game

A pixel art themed idle RPG game built with React, Vite, and Material-UI. Players can manage their character's equipment, compare items, and build their perfect loadout in a retro gaming aesthetic.

## 🎮 Features

### Equipment Management
- **RPG-style Equipment Layout**: Classic character equipment interface with slots positioned around a character silhouette
- **10 Equipment Slots**: Weapon, Shield, Helmet, Chest, Legs, Boots, Gloves, Cape, Ring, and Amulet
- **Item Rarity System**: Common, Uncommon, Rare, Epic, and Legendary items with color-coded borders
- **Stat Comparison**: Real-time tooltip comparisons showing stat differences between equipped and inventory items

### Inventory System
- **Smart Filtering**: Filter inventory by equipment type when a slot is selected
- **Fixed Height Items**: Consistent grid layout with scrollable stats for items with many properties
- **Hover Tooltips**: Detailed comparison tooltips showing current vs new item stats
- **Visual Feedback**: Color-coded stat improvements (green for better, red for worse)

### Data Persistence
- **LocalStorage Integration**: All equipped items and inventory are automatically saved
- **Cross-tab Sync**: Data persists across browser tabs and sessions
- **Error Handling**: Graceful fallback to sample data if storage fails

### User Experience
- **Pixel Art Theme**: Retro gaming aesthetic with custom scrollbars and animations
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Keyboard Support**: Right-click to equip items
- **Visual Feedback**: Hover effects, animations, and selection indicators

## 🛠️ Technology Stack

- **Frontend**: React 19.1.0
- **Build Tool**: Vite 7.0.0
- **UI Framework**: Material-UI (MUI) 7.2.0
- **Styling**: SCSS with CSS Modules
- **Font**: Press Start 2P (Pixel Art Font)
- **State Management**: React Hooks with localStorage persistence

## 📋 Prerequisites

### Node.js Version
**Recommended**: Node.js 20.0.0 or higher
**Minimum**: Node.js 18.0.0

The project uses modern React features and Vite, which require a recent Node.js version. Node.js 14 may cause compatibility issues.

### Package Manager
- npm (comes with Node.js)
- yarn (alternative)
- pnpm (alternative)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd idle-chaos
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

### 5. Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
idle-chaos/
├── public/
│   └── images/
│       ├── characters/     # Character sprites
│       ├── enemies/        # Enemy sprites
│       ├── equipment/      # Equipment icons
│       └── skills/         # Skill icons
├── src/
│   ├── assets/
│   │   └── styles/         # SCSS modules
│   ├── pages/              # React components
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main app component
│   └── main.jsx           # Entry point
├── package.json
├── vite.config.js
└── README.md
```

## 🎯 Key Components

### Equipment Page (`src/pages/Equipment.jsx`)
- Main equipment management interface
- RPG-style character layout
- Inventory filtering and comparison
- LocalStorage integration

### Common Styles (`src/assets/styles/common.scss`)
- Global pixel art theme
- Custom scrollbar styling
- CSS variables for consistent theming
- Utility classes and animations

### Equipment Styles (`src/assets/styles/Equipment.module.scss`)
- Equipment slot layouts
- Inventory grid styling
- Tooltip and dialog styles
- Responsive design rules

## 🎨 Design System

### Color Palette
- **Primary Background**: `#2a2a4a`
- **Secondary Background**: `#3a3a5a`
- **Accent Color**: `#96ceb4`
- **Gold Color**: `#ffd700`
- **Danger Color**: `#ff6b6b`
- **Success Color**: `#4ecdc4`

### Typography
- **Font**: Press Start 2P (Pixel Art)
- **Text Shadows**: Consistent pixel art styling
- **Responsive**: Font sizes scale with screen size

### Animations
- **Pixel Bounce**: Hover effects on interactive elements
- **Pixel Glow**: Special effects for important items
- **Smooth Transitions**: 0.2s ease transitions

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Adding New Equipment
1. Add item data to `SAMPLE_INVENTORY` array
2. Include required fields: `id`, `name`, `type`, `rarity`, `stats`
3. Add corresponding icon to `public/images/equipment/`

### Styling Guidelines
- Use CSS variables from `common.scss` for consistency
- Follow pixel art aesthetic with sharp borders
- Maintain responsive design principles
- Use SCSS modules for component-specific styles

## 🌐 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 📱 Responsive Design

### Breakpoints
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

### Mobile Features
- Equipment slots stack vertically
- Inventory grid adapts to screen size
- Touch-friendly interactions
- Optimized font sizes

## 🐛 Troubleshooting

### Common Issues

**Node.js Version Issues**
```bash
# Check your Node.js version
node --version

# If below 18, update Node.js
# Download from https://nodejs.org/
```

**Port Already in Use**
```bash
# Kill process on port 5173
npx kill-port 5173
# Or use a different port
npm run dev -- --port 3000
```

**LocalStorage Issues**
- Clear browser cache and localStorage
- Check browser console for errors
- Ensure browser supports localStorage

**Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎮 Game Features Roadmap

### Planned Features
- [ ] Battle system integration
- [ ] Character progression
- [ ] Item crafting system
- [ ] Multiplayer support
- [ ] Achievement system
- [ ] Sound effects and music

### Current Status
- ✅ Equipment management system
- ✅ Inventory system
- ✅ Data persistence
- ✅ Responsive design
- ✅ Pixel art theme

## 📞 Support

For questions, issues, or feature requests:
- Create an issue on GitHub
- Contact the development team
- Check the troubleshooting section above

---

**Happy Gaming! 🎮✨**
