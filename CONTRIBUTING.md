# 🤝 Contributing to TaskFlow

Thank you for your interest in contributing to **TaskFlow**! We welcome contributions from developers of all skill levels. To maintain high code quality and smooth collaboration, please adhere to the guidelines outlined below.

---

## 1. Development Workflow

### 1.1 Fork & Clone
1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/TaskFlow.git
   cd TaskFlow
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/Vishaldave45/TaskFlow.git
   ```

### 1.2 Branching Convention
Create a descriptive branch for your work:
- `feature/<feature-name>` (e.g., `feature/slack-notifications`)
- `bugfix/<issue-name>` (e.g., `bugfix/cursor-pagination-offset`)
- `docs/<doc-update>` (e.g., `docs/api-guide-update`)
- `refactor/<cleanup>` (e.g., `refactor/tanstack-query-hooks`)

---

## 2. Commit Message Guidelines

We enforce the [Conventional Commits](https://www.conventionalcommits.org/) specification for clear, parseable git history:

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

### Supported Types:
- `feat`: A new feature for users
- `fix`: A bug fix
- `docs`: Documentation changes only
- `style`: Formatting, missing semicolons, etc. (no code logic changes)
- `refactor`: Code refactoring without changing user-facing behavior
- `perf`: Code changes that improve performance
- `test`: Adding or correcting tests
- `chore`: Build scripts, CI workflow, or dependency updates

*Examples:*
- `feat(tasks): implement cursor-based infinite scroll list`
- `fix(auth): rotate refresh token on subsequent refresh requests`
- `docs(api): document query parameters for task filters`

---

## 3. Code Standards & Quality Checks

Before submitting a Pull Request, ensure that all automated checks pass locally.

### 3.1 Backend Quality Checks
From the `backend/` directory:

```bash
# 1. Run Django system validation
uv run python manage.py check

# 2. Run test suite
uv run pytest

# 3. Check linting with Ruff (if installed)
uv run ruff check .
```

### 3.2 Frontend Quality Checks
From the `frontend/` directory:

```bash
# 1. Run linter
npm run lint

# 2. Run TypeScript compiler & build
npm run build
```

---

## 4. Pull Request (PR) Submission Checklist

When opening a Pull Request:
- [ ] Ensure your branch is rebased on the latest `main` branch.
- [ ] Provide a clear, descriptive title following Conventional Commits.
- [ ] Reference related issues (e.g., `Closes #12`).
- [ ] Explain **what** changed and **why**.
- [ ] Verify that all automated tests and builds pass in CI.
- [ ] Keep PRs scoped to a single logical feature or fix.

Thank you for making TaskFlow better! 🚀
