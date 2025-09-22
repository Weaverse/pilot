# Pilot v6.0.1 Release Changes

## Summary
This document outlines the changes and preparation for the next version release of the Weaverse Pilot theme.

## Current Status (as of v6.0.0)
The Pilot theme has just undergone a major release with significant architectural improvements:

### Major Changes in v6.0.0
- **Component Architecture Refactor**: Removed forwardRef pattern across components for simplified props handling
- **State Management Enhancement**: Replaced React context with Zustand store for product quantity management
- **Judge.me Integration Overhaul**: Restructured API routes with new `/api/product/$productHandle` endpoint structure
- **Code Organization**: Moved RevealUnderline component to proper `/components` directory
- **Featured Products Enhancement**: Added collection and manual selection options alongside existing auto mode

## Recommended Next Steps for v6.0.1

### 1. Documentation Updates ✅
- [x] Updated CHANGELOG.md with comprehensive v6.0.0 changes
- [x] Created release planning documentation

### 2. Code Quality Improvements
The current codebase has minimal linting issues, mostly related to:
- Environment variable naming conventions (acceptable for .env variables)
- Some constant naming conventions (acceptable for API constants)

### 3. Dependency Management ✅
All key dependencies are current:
- @weaverse/hydrogen: 5.4.2 (latest)
- @shopify/hydrogen: 2025.5.0 (latest) 
- react-router: 7.9.1 (latest)

### 4. Testing & Quality Assurance
- [x] TypeScript compilation successful
- [x] Production build successful
- [ ] E2E tests validation recommended
- [ ] Performance audit recommended

## Open Issues to Address in Future Releases

### High Priority (v6.0.1 or v6.1.0)
1. **GraphiQL/subrequest-profiler routing conflict** (Issue #321)
   - Affects developer experience
   - Should be addressed in next patch/minor release

### Medium Priority (v6.1.0)
2. **Pagination component fixes** (Issue #285)
3. **Featured Products collection selection** (Issue #316) - Already implemented

### Low Priority (v6.2.0+)
4. **Subscriptions demo implementation** (Issue #293)
5. **Scroll restoration animation** (Issue #283)

## Release Preparation Checklist

### For v6.0.1 (Patch Release)
- [x] Verify build stability
- [x] Update documentation
- [ ] Run E2E tests
- [ ] Address any critical bugs
- [ ] Version bump in package.json
- [ ] Create release notes

### Development Workflow
1. **Development**: Make changes in feature branches
2. **Testing**: Ensure all tests pass (`npm run e2e`, `npm run build`, `npm run typecheck`)
3. **Code Quality**: Run `npm run biome:fix` before committing
4. **Release**: Update version, CHANGELOG, create PR, merge to main

## Key Dependencies & Versions

```json
{
  "@weaverse/hydrogen": "^5.4.2",
  "@shopify/hydrogen": "2025.5.0", 
  "react-router": "^7.9.1",
  "react": "19.1.1",
  "zustand": "^5.0.8"
}
```

## Architecture Highlights (v6.0.0)
- Modern React 19 with React Router 7
- Zustand for state management
- TypeScript for type safety
- Tailwind CSS v4 for styling
- Biome for linting and formatting
- Weaverse visual page builder integration

## Conclusion
The Pilot theme is in excellent condition following the v6.0.0 release. The next version (v6.0.1) should focus on:
1. Addressing the GraphiQL routing issue
2. Ensuring continued stability
3. Minor documentation improvements

The codebase is well-structured, performant, and ready for production use.