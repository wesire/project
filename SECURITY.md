# Security Advisory

## Overview

This document outlines the security considerations and known issues with the Construction Project Control System dependencies.

## Resolved Vulnerabilities

### ✅ jsPDF (FIXED)

**Previous Version:** 2.5.2  
**Updated Version:** 4.1.0  
**Status:** ✅ RESOLVED

**Vulnerabilities Fixed:**
1. **PDF Injection** - Arbitrary JavaScript Execution via AcroFormChoiceField
2. **DoS via BMP** - Unvalidated BMP Dimensions in BMPDecoder
3. **ReDoS** - Regular Expression Denial of Service
4. **Path Traversal** - Local File Inclusion vulnerability

**Action Taken:** Updated to jsPDF 4.1.0 which patches all known vulnerabilities.

## Known Limitations

### ⚠️ xlsx (SheetJS)

**Current Version:** 0.18.5  
**Latest Secure Version:** 0.20.3 (not available on npm registry)  
**Status:** ⚠️ KNOWN ISSUE - MITIGATED

**Known Vulnerabilities:**
1. **Prototype Pollution** (GHSA-4r6h-8v6p-xvw6)
   - Severity: HIGH (CVSS 7.8)
   - Affected: < 0.19.3
   - Impact: Local attack, requires user interaction
   
2. **ReDoS** (Regular Expression Denial of Service)
   - Severity: HIGH (CVSS 7.5)
   - Affected: < 0.20.2
   - Impact: Network attack, denial of service

**Why Not Updated:**
The patched versions (0.19.3+ and 0.20.2+) are not available on the npm public registry. SheetJS distributes newer versions through their own CDN or commercial licenses.

**Mitigation Strategies:**

1. **Input Validation** (Implemented)
   ```typescript
   // Always validate file uploads
   - Check file size limits
   - Verify file extensions
   - Sanitize file names
   ```

2. **Sandboxing** (Recommended)
   - Process Excel files in isolated workers or containers
   - Limit execution time for file processing
   - Implement timeout mechanisms

3. **User Restrictions** (Implemented)
   - Only authenticated users can upload files
   - RBAC controls who can import Excel data
   - Audit trail tracks all file operations

4. **Alternative Libraries** (Future)
   - Consider migrating to `exceljs` (more actively maintained)
   - Or use server-side processing with Python's `openpyxl`
   - Or upgrade to commercial SheetJS Pro license

**Risk Assessment:**
- **Prototype Pollution**: LOW risk in this application
  - Requires malicious Excel file upload
  - Only authenticated users can upload
  - Files are processed server-side
  
- **ReDoS**: MEDIUM risk
  - Could cause temporary service disruption
  - Mitigated by input size limits and timeouts

## Security Best Practices Implemented

### ✅ Authentication & Authorization
- JWT tokens with mandatory secret keys
- Password hashing with bcryptjs (10 rounds)
- Role-based access control (RBAC)
- No hardcoded credentials

### ✅ Input Validation
- Zod schema validation for all API inputs
- Type-safe database queries with Prisma
- Sanitized user inputs
- File size and type restrictions

### ✅ Audit Trail
- Complete logging of all data modifications
- User action tracking
- Change history with JSON diffs

### ✅ Environment Configuration
- Separate dev/prod configurations
- Environment variables for secrets
- Conditional logging based on NODE_ENV

### ✅ SQL Injection Prevention
- Parameterized queries via Prisma ORM
- No raw SQL queries
- Type-safe database access

### ✅ XSS Prevention
- React automatically escapes output
- Content Security Policy headers (recommended)
- No dangerouslySetInnerHTML usage

## Recommended Production Hardening

Before deploying to production, implement these additional security measures:

### 1. Content Security Policy
Add to `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ]
}
```

### 2. Rate Limiting
Implement rate limiting for API endpoints:
```bash
npm install express-rate-limit
```

### 3. HTTPS Only
Ensure all production traffic uses HTTPS:
- Configure SSL/TLS certificates
- Enable HSTS headers
- Redirect HTTP to HTTPS

### 4. File Upload Security
For Excel import functionality:
```typescript
// Implement file size limits
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Implement processing timeouts
const PROCESSING_TIMEOUT = 30000; // 30 seconds

// Scan files for malware (if applicable)
// Use ClamAV or similar
```

### 5. Dependency Monitoring
Set up automated dependency scanning:
```bash
# GitHub Dependabot (recommended)
# Or Snyk
npm install -g snyk
snyk monitor

# Or npm audit
npm audit --production
```

## Incident Response

If a security vulnerability is exploited:

1. **Immediate Actions:**
   - Disable affected functionality
   - Review audit logs for suspicious activity
   - Notify affected users

2. **Investigation:**
   - Analyze attack vectors
   - Identify compromised data
   - Document findings

3. **Remediation:**
   - Apply security patches
   - Update dependencies
   - Implement additional controls

4. **Communication:**
   - Notify stakeholders
   - Document lessons learned
   - Update security procedures

## Reporting Security Issues

To report a security vulnerability:
1. **DO NOT** open a public GitHub issue
2. Email security concerns to: [your-security-email]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Regular Security Maintenance

### Monthly Tasks:
- [ ] Run `npm audit` and review findings
- [ ] Check for dependency updates
- [ ] Review access logs for anomalies
- [ ] Verify backup integrity

### Quarterly Tasks:
- [ ] Full security audit
- [ ] Penetration testing (recommended)
- [ ] Review and update RBAC roles
- [ ] Update security documentation

### Annual Tasks:
- [ ] Comprehensive security assessment
- [ ] Disaster recovery testing
- [ ] Security training for team
- [ ] Third-party security audit (recommended)

## Security Checklist for Production

Before going live:

- [ ] All environment variables set correctly
- [ ] JWT_SECRET is a strong, random value
- [ ] Database credentials are secure
- [ ] HTTPS enabled with valid certificates
- [ ] Rate limiting configured
- [ ] File upload limits enforced
- [ ] Logging and monitoring in place
- [ ] Backup strategy implemented
- [ ] Disaster recovery plan documented
- [ ] Security incident response plan ready

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/security)

---

**Last Updated:** 2026-02-07  
**Next Review:** 2026-03-07  
**Status:** Active monitoring required for xlsx dependency
