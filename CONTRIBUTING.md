# Contributing Guide: Branch Workflow

This document describes the branch workflow for developing, reviewing, and merging features and improvements in the daza.ar-env project. It is designed to maintain code quality, encourage collaboration, and align with open source best practices.

---

## Branching Model

- **main**: Stable, production-ready branch.
- **develop**: Main integration branch for ongoing development.
- **feature/** and **improvement/**: For each new feature or improvement, create a branch from `develop` named `feature/<short-description>` or `improvement/<short-description>`.

## Issue-Driven Development

- Use the [feature_improvement.md](.github/ISSUE_TEMPLATE/feature_improvement.md) template to create a detailed issue for every new feature or improvement.
- Reference the issue number in the branch name, commit messages, and pull request (PR) descriptions.

## Commit & PR Workflow

- Make atomic, well-documented commits that align with KISS, SOLID, and CLEAN principles.
- Example branch: `feature/12-navbar-component`
- Example commit: `feat: add navbar component (closes #12)`
- Open a PR to merge the feature branch into `develop`.
- Use the PR description to reference the issue and summarize the changes.
- Request review from at least one other contributor before merging.
- Only merge PRs that pass all checks and reviews.
- After sufficient testing and review, merge `develop` into `main` for releases.
- Delete the feature branch after merging.

## Pull Request Checklist

- [ ] Branch from `develop`
- [ ] Reference the issue in branch name and commits
- [ ] Use the issue template
- [ ] PR references the issue and summarizes changes
- [ ] All checks pass before merging

## Design Principles

- **KISS**: Keep the workflow as simple as possible.
- **SOLID**: Encourage code and process that follow SOLID principles.
- **CLEAN**: Promote readable, maintainable, and well-structured code and history.
- **Minimal dependencies**: Do not require extra tools beyond git and GitHub unless absolutely necessary.

## Acceptance Criteria

- [ ] Branch workflow is documented in the repository (this file)
- [ ] All contributors follow the workflow for new features and improvements
- [ ] Issues and PRs are linked and use the feature_improvement.md template
- [ ] Workflow is reviewed and agreed upon by project maintainers
- [ ] All development is done in `develop` and only stable, tested code is merged into `main`

## Additional Context

- See [feature_improvement.md](.github/ISSUE_TEMPLATE/feature_improvement.md) for the issue template to use as a starting point for all new work.
- Consider adding a short summary of the workflow to the README.
- This workflow aligns with the current repository setup: `main` and `develop` branches, feature branches from `develop`, and a strong focus on code quality and simplicity.
