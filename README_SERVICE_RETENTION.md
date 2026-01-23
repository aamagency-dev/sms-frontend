# Frontend Implementation - Service Retention Intervals

## 📁 Files Created

### Components
- `src/components/ServiceRetentionIntervals.js` - Main component for managing intervals
- `src/components/ServiceRetentionIntervals.css` - Styles for the component

### Services
- `src/services/serviceRetentionApi.js` - API service for backend communication

### Pages
- `src/pages/BusinessSettings.js` - Example settings page integration
- `src/pages/BusinessSettings.css` - Settings page styles

## 🔧 Integration Steps

### 1. Install Dependencies
Make sure you have axios installed:
```bash
npm install axios
```

### 2. Add to Your Router
Add the BusinessSettings component to your router:
```javascript
import BusinessSettings from './pages/BusinessSettings';

// In your router configuration
<Route path="/settings/:businessId" component={BusinessSettings} />
```

### 3. Update API Configuration
Make sure your `src/services/api.js` is configured with the correct base URL and authentication:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
});

// Add authentication interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## 🎨 Features

### What the Component Does:
1. **Displays service categories** with Swedish names and icons
2. **Shows retention intervals** for each service
3. **Allows inline editing** - click any interval to edit
4. **Add new services** with category selection
5. **Delete services** with confirmation
6. **Real-time updates** to the backend

### User Interactions:
- **Click on an interval** to edit it
- **Press Enter** or click away to save
- **Add new services** using the form at the bottom
- **Delete services** with the trash icon

## 📱 Responsive Design

The component is fully responsive:
- Desktop: Full-width layout with horizontal alignment
- Mobile: Stacked layout with adjusted spacing

## 🔍 API Endpoints Used

```javascript
GET /api/businesses/service-categories     // Get categories
GET /api/businesses/service-intervals?business_id={id}  // Get intervals
PUT /api/businesses/service-intervals     // Update interval
POST /api/businesses/service-intervals    // Create interval
DELETE /api/businesses/service-intervals/{id}  // Delete interval
```

## 🎨 Customization

### Change Colors
Edit `ServiceRetentionIntervals.css`:
```css
.category-section {
  background: #your-color; /* Change category background */
}

.service-item:hover {
  border-color: #your-accent-color; /* Change hover color */
}
```

### Add New Categories
Update `SERVICE_CATEGORIES` in `serviceRetentionApi.js`:
```javascript
const SERVICE_CATEGORIES = {
  new_category: {
    name: 'Ny Kategori',
    description: 'Beskrivning',
    icon: '🎯',
    defaultInterval: 2.0
  }
};
```

## 🔧 Troubleshooting

### If Intervals Don't Load:
1. Check browser console for errors
2. Verify authentication token is set
3. Check network tab for API responses

### If Updates Don't Save:
1. Check if user has permissions
2. Verify business ID is correct
3. Check backend logs for errors

## 🚀 Next Steps

1. Add loading states for better UX
2. Implement optimistic updates
3. Add undo functionality for deletions
4. Add bulk edit capabilities
5. Add analytics for interval effectiveness
