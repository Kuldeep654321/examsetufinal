# Security Policy

## Reporting a vulnerability

Please do not publish security vulnerabilities in a public issue.

Report suspected vulnerabilities privately to the project maintainer through the repository's private security contact or GitHub Security Advisories. Include:

- A short description of the issue
- Steps to reproduce
- Affected route, component or configuration
- Potential impact
- A suggested mitigation, if available

Do not include passwords, tokens, private database URLs or other secrets in reports.

## Secrets

- Never commit `.env` files, JWT secrets, database passwords or API tokens.
- Use `.env.example` as the template for local configuration.
- Rotate any secret that may have been exposed.
- Production credentials must be supplied through the deployment environment.
