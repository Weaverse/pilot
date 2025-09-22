# Release Plan for Pilot v6.0.1

## Current Status
- **Current Version**: 6.0.0
- **Last Release Date**: September 22, 2025
- **Next Planned Version**: 6.0.1 (Patch Release)

## Changes Since v6.0.0
- [x] Updated CHANGELOG.md to properly document v6.0.0 changes
- [x] Dependencies are current and stable
- [x] Build passes successfully
- [x] Code quality is maintained with minimal linting issues

## Proposed Changes for v6.0.1

### Bug Fixes & Improvements
- [ ] Address any critical linting issues (currently mostly naming convention for env vars - acceptable)
- [ ] Fix GraphiQL and subrequest-profiler routing conflict (Issue #321) - if needed
- [ ] Minor dependency updates for security patches

### Quality Assurance
- [x] TypeScript builds successfully
- [x] All tests pass
- [x] Linting issues reviewed (mostly acceptable)
- [ ] E2E tests validation
- [ ] Performance audit

### Documentation
- [x] CHANGELOG.md updated with v6.0.0 details
- [ ] README.md review for accuracy
- [ ] Any API documentation updates

## Future Releases Planning

### v6.1.0 (Minor Release) - Potential Features
Based on open issues and feature requests:
- Enhanced Featured Products section (Issue #316) - Already implemented in v6.0.0
- Subscriptions demo implementation (Issue #293)
- Pagination component fixes (Issue #285)

### v7.0.0 (Major Release) - Breaking Changes
- Potential React Router 8 upgrade
- Major dependency updates that require breaking changes
- Architectural improvements

## Release Checklist Template

### Pre-Release
- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Run full test suite
- [ ] Build validation
- [ ] Performance audit
- [ ] Documentation review

### Release
- [ ] Create release branch
- [ ] Tag release
- [ ] Generate release notes
- [ ] Publish to npm (if applicable)
- [ ] Create GitHub release

### Post-Release
- [ ] Monitor for issues
- [ ] Update documentation sites
- [ ] Communicate changes to team
- [ ] Plan next release cycle

## Dependencies Status
All key dependencies are up-to-date:
- @weaverse/hydrogen: 5.4.2 (latest)
- @shopify/hydrogen: 2025.5.0 (latest)
- react-router: 7.9.1 (latest)

## Notes
- v6.0.0 included major architectural changes, so v6.0.1 should focus on stability
- The codebase is currently in good shape with successful builds
- Open issues should be prioritized for future releases