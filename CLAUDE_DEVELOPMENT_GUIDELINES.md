# Claude Development Guidelines

This document serves as a reference for Claude Code when working on the Poker Connect Hub codebase.

## Core Principles

### 🔒 NEVER BREAK ANYTHING

- **Preserve all existing functionality** - Every feature that works must continue working
- **Maintain backward compatibility** - Existing workflows and user interactions must remain intact
- **Test thoroughly** - Always verify that changes don't introduce regressions
- **Build successfully** - Code must compile and build without errors

### 🎯 DO MINIMUM CHANGES POSSIBLE

- **Surgical precision** - Make the smallest possible change to achieve the goal
- **Avoid scope creep** - Focus only on the specific requirement
- **Preserve existing patterns** - Don't refactor unless absolutely necessary
- **Maintain current architecture** - Work within existing system design

## Development Workflow

### Before Making Changes

1. **Understand the current system** - Read existing code thoroughly
2. **Identify dependencies** - Map out what components depend on what you're changing
3. **Plan minimal changes** - Design the smallest possible intervention
4. **Test current functionality** - Ensure you understand how it currently works

### During Development

1. **Make incremental changes** - Small, testable modifications
2. **Preserve interfaces** - Keep existing function signatures and component props
3. **Maintain existing styling patterns** - Follow current CSS/styling approaches
4. **Document reasoning** - Comment why changes were made

### After Changes

1. **Build the application** - `npm run build` must succeed
2. **Test affected functionality** - Verify all related features still work
3. **Verify visual consistency** - Check that UI changes look correct across the app
4. **Test user workflows** - Ensure complete user journeys remain functional

## Specific Guidelines for This Project

### Card System

- **Never change card notation format** - Support both symbol (A♥) and letter (Ah) notation
- **Preserve card input functionality** - Dropdown suggestions, keyboard navigation, parsing
- **Maintain card display consistency** - All card components should use the centralized PlayingCard component

### UI Components

- **Keep existing component interfaces** - Don't change prop signatures without strong justification
- **Preserve styling patterns** - Use existing Tailwind classes and color schemes
- **Maintain responsive behavior** - Ensure changes work on mobile and desktop

### Poker Logic

- **Never modify game rules** - Poker logic should remain untouched unless specifically requested
- **Preserve state management** - Don't change how game state flows through the application
- **Maintain API contracts** - Backend integration points should remain stable

## Emergency Procedures

### If Something Breaks

1. **Revert immediately** - Undo the breaking change
2. **Understand the failure** - Analyze what went wrong
3. **Plan a safer approach** - Design a more conservative solution
4. **Test more thoroughly** - Expand testing scope

### If Unsure

1. **Ask clarifying questions** - Get specific requirements
2. **Propose minimal solutions** - Suggest the smallest possible change
3. **Highlight risks** - Identify potential breaking points
4. **Suggest alternatives** - Offer different approaches

## Success Metrics

A successful change should:

- ✅ Accomplish the stated goal
- ✅ Build without errors or warnings
- ✅ Preserve all existing functionality
- ✅ Maintain visual consistency
- ✅ Require minimal code changes
- ✅ Not introduce technical debt

## Remember

> "The best code is no code. The second best code is minimal code that solves the problem."

When in doubt, choose the path that makes the smallest possible change to achieve the desired outcome while preserving everything that currently works.
