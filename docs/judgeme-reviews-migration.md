# Judge.me Reviews Redesign Migration Guide

This guide explains how to migrate from the old Judge.me reviews section to the new redesigned version.

## Overview

The redesigned Judge.me reviews section includes:
- Modern, responsive two-column layout
- Enhanced filtering and sorting capabilities
- Improved image modal with keyboard navigation
- Better accessibility support
- URL state management for filters
- TypeScript throughout for better type safety

## Migration Steps

### 1. Component Replacement

**Old Section:**
```tsx
// sections/judgeme-reviews/index.tsx
import JudgemeReviewSection from './index';
```

**New Section:**
```tsx
// sections/judgeme-reviews/index-redesigned.tsx
import JudgemeReviewSectionRedesigned from './index-redesigned';
```

### 2. Weaverse Integration

The redesigned section is already registered in Weaverse components. To use it:

1. In the Weaverse visual editor, select "Judge.me Reviews (Redesigned)" from the components list
2. Configure settings through the visual interface

### 3. Schema Changes

The new section has additional settings:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `enableReviewForm` | Checkbox | true | Allow customers to write reviews |
| `showWriteReviewButton` | Checkbox | true | Display "Write a Review" button |
| `maxReviewsPerPage` | Number | 10 | Reviews per page (1-50) |
| `enableImageModal` | Checkbox | true | Enable image lightbox |
| `enablePagination` | Checkbox | true | Show pagination controls |
| `desktopColumns` | Select | 1 | Desktop layout columns |
| `mobileColumns` | Select | 1 | Mobile layout columns |

### 4. API Updates

The redesigned section uses the new API endpoints:

```tsx
// New API route
app/routes/($locale).api.reviews.$productHandle.tsx

// Updated utilities
app/utils/judgeme-redesigned.ts
```

### 5. Route Updates

The product route has been updated to include reviews data:

```tsx
// Before
const [{ shop, product }, weaverseData] = await Promise.all([...]);

// After
const [{ shop, product }, weaverseData, productReviews] = await Promise.all([...]);
```

### 6. URL State Management

Filters and pagination now persist in URL:

```
?rating=5&sortBy=rating_high&page=2
```

This makes filtered views shareable and bookmarkable.

### 7. Breaking Changes

#### Props Changes
- Removed `initialReviews` - data is now fetched from loader
- `productId` and `productHandle` are now optional (fetched from loader)
- Added `loaderData` prop for Weaverse integration

#### Component Structure
- Old: Single component with internal state
- New: Modular component architecture with:
  - `ReviewsSummary` - Statistics and rating breakdown
  - `ReviewsFilters` - Filter and sort controls
  - `ReviewsList` - Reviews display
  - `ReviewItem` - Individual review
  - `ReviewPagination` - Pagination controls
  - `ReviewImageModal` - Image lightbox
  - `ReviewForm` - Review submission form

#### Styling Changes
- Updated to use Tailwind CSS v4
- Better responsive design
- Improved dark mode support
- Consistent spacing and typography

### 8. Feature Enhancements

#### New Features
1. **Rating Filter**: Filter reviews by star rating
2. **Sort Options**: Sort by newest, oldest, highest, or lowest rating
3. **Image Modal**: Full-screen image viewer with navigation
4. **URL Persistence**: Filter state saved in URL
5. **Accessibility**: ARIA labels, keyboard navigation, screen reader support
6. **Loading States**: Skeleton loaders during data fetching
7. **Error Handling**: Graceful error states with retry options

#### Improved Features
1. **Responsive Design**: Better mobile and tablet layouts
2. **Performance**: Optimized rendering and data fetching
3. **Type Safety**: Full TypeScript integration
4. **Testing**: Comprehensive E2E test coverage

### 9. Testing

The redesigned section includes comprehensive E2E tests:

```bash
# Run all tests
npm run e2e

# Run specific test files
npm run e2e tests/reviews-display.spec.ts
npm run e2e tests/reviews-filter.spec.ts
npm run e2e tests/reviews-pagination.spec.ts
# ... etc
```

### 10. Backward Compatibility

The old section remains available. To maintain backward compatibility:

1. Keep the old `judgeme-reviews` section
2. Add new `judgeme-reviews-redesigned` section
3. Allow merchants to choose which version to use
4. Plan for eventual deprecation of the old version

### 11. Migration Checklist

- [ ] Update product route to include `productReviews` in loader data
- [ ] Add new API route for reviews
- [ ] Install redesigned section components
- [ ] Register section in Weaverse components
- [ ] Test all features (display, filtering, pagination, form submission)
- [ ] Run E2E tests to ensure no regressions
- [ ] Update documentation and guides
- [ ] Test accessibility features
- [ ] Verify responsive design across devices

### 12. Troubleshooting

#### Common Issues

**Reviews not loading:**
- Verify Judge.me API credentials are configured
- Check product handle matches in Judge.me
- Ensure API endpoints are accessible

**Filters not working:**
- Verify URL state management hook is working
- Check filter change handlers
- Ensure search params are properly updated

**Images not displaying in modal:**
- Verify image URLs are correct
- Check modal state management
- Ensure click handlers are properly attached

### 13. Performance Considerations

The redesigned section includes performance optimizations:
- Lazy loading of images
- Debounced filter changes
- Optimized re-renders
- Efficient data fetching with proper caching

### 14. Future Enhancements

Planned improvements for future versions:
- Infinite scroll option
- Review translation support
- Rich text review formatting
- Video review support
- Advanced analytics integration

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review E2E test examples
3. Submit issues to the project repository
4. Contact the development team