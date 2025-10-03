# Security Features - Visual Guide

## 🎯 Quick Overview

This guide shows you how to use the new security features to keep your account safe.

---

## 1. Active Login Sessions

### Where to Find It
Navigate to: **Profile Menu → Security** or directly to `/user/security`

### What You'll See

```
┌────────────────────────────────────────────────────────────┐
│                    Security Settings                        │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Active Login Sessions                                      │
│  Manage devices where you're currently logged in.          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Chrome on Windows        [Current Session]          │  │
│  │  IP Address: 192.168.1.1                             │  │
│  │  Last Active: 2 minutes ago                          │  │
│  │  Signed in: Oct 3, 2024 at 10:30 AM                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Safari on macOS                      [Logout]       │  │
│  │  IP Address: 192.168.1.5                             │  │
│  │  Last Active: 3 hours ago                            │  │
│  │  Signed in: Oct 2, 2024 at 8:15 PM                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### How to Use

1. **View Active Sessions**
   - See all devices where you're logged in
   - Check last activity time
   - Verify IP addresses

2. **Logout from a Device**
   - Click the "Logout" button next to any session
   - Confirm the action
   - That device will be immediately logged out

3. **Current Session**
   - Your current session is marked with a green badge
   - Cannot be logged out from this page (use normal logout)

### Security Tips
- ✅ Review your sessions regularly
- ✅ Logout from unknown devices immediately
- ✅ Check last activity times for suspicious behavior
- ✅ Verify IP addresses match your locations

---

## 2. Password Management

### Reset Password Flow

#### Step 1: Request Reset
Navigate to: **Login Page → Forgot Password**

```
┌────────────────────────────────────────────────────────────┐
│              🔑 Reset Password                              │
│                                                             │
│  Enter your email address and we'll send you a link       │
│  to reset your password.                                   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Email: [your-email@example.com]                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [Send Reset Link]                                         │
│                                                             │
│  💡 Security Tips                                          │
│  • The reset link will expire in 1 hour                   │
│  • Never share your reset link with anyone                │
│  • Contact support if you don't receive the email         │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

#### Step 2: Success Message
```
┌────────────────────────────────────────────────────────────┐
│              ✅ Email Sent!                                 │
│                                                             │
│  We've sent a password reset link to your email address.  │
│  Please check your inbox and follow the instructions to   │
│  reset your password.                                      │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

#### Step 3: Set New Password
Click the link in your email to access:

```
┌────────────────────────────────────────────────────────────┐
│              🔒 Set New Password                            │
│                                                             │
│  Please enter your new password below.                     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ New Password: [••••••••]                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Confirm New Password: [••••••••]                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Password Requirements:                                    │
│  ✓ At least 8 characters long                             │
│  ✓ Contains uppercase and lowercase letters               │
│  ✓ Contains at least one number                           │
│                                                             │
│  [Reset Password]                                          │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

#### Step 4: Success & Redirect
```
┌────────────────────────────────────────────────────────────┐
│              ✅ Password Reset Successful!                  │
│                                                             │
│  Your password has been successfully reset. You can now    │
│  login with your new password.                             │
│                                                             │
│  Redirecting to login page...                              │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Change Password (When Logged In)
Navigate to: **Security Settings**

```
┌────────────────────────────────────────────────────────────┐
│                                                             │
│  Password Management                                        │
│  Keep your account secure by regularly updating your       │
│  password.                                                  │
│                                                             │
│  [Change Password]                                         │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Two-Factor Authentication (Coming Soon)

### Current Preview
```
┌────────────────────────────────────────────────────────────┐
│                                                             │
│  Two-Factor Authentication              [Coming Soon]      │
│  Add an extra layer of security to your account by         │
│  enabling two-factor authentication.                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🔒 Enhanced Security (Coming Soon)                   │  │
│  │                                                        │  │
│  │  Two-factor authentication will require a             │  │
│  │  verification code in addition to your password       │  │
│  │  when logging in, providing an extra layer of         │  │
│  │  protection for your account.                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [Enable Two-Factor Authentication] (disabled)             │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### What's Coming
When 2FA is released, you'll be able to:
- ✨ Enable TOTP (Time-based One-Time Password)
- ✨ Scan QR code with authenticator app
- ✨ Generate backup codes
- ✨ Require code for every login

---

## 🛡️ Security Best Practices

### For Your Passwords
1. **Use Strong Passwords**
   - Mix uppercase and lowercase letters
   - Include numbers and special characters
   - Avoid common words or personal information
   - Use unique passwords for different accounts

2. **Keep Them Safe**
   - Never share your password with anyone
   - Don't write passwords down in plain text
   - Use a password manager for complex passwords
   - Change passwords if you suspect compromise

### For Your Sessions
1. **Regular Reviews**
   - Check active sessions weekly
   - Logout unknown devices immediately
   - Monitor last activity times

2. **Public Devices**
   - Always logout after use
   - Don't use "Remember Me" on shared computers
   - Clear browser data after use

3. **Suspicious Activity**
   - Unknown devices? Logout immediately
   - Unfamiliar locations? Change password
   - Unexpected logins? Enable 2FA when available

### For Account Recovery
1. **Email Security**
   - Keep your email account secure
   - Use strong password for email too
   - Enable 2FA on your email provider

2. **Reset Links**
   - Click links only from official emails
   - Check sender address carefully
   - Links expire in 1 hour - act quickly

---

## 📱 Mobile Experience

All security features work great on mobile:
- ✅ Responsive design for all screen sizes
- ✅ Touch-friendly buttons
- ✅ Easy to read session information
- ✅ Quick logout from any device

---

## ❓ Frequently Asked Questions

### Q: How long do sessions last?
**A:** Sessions automatically expire after 30 days of inactivity.

### Q: Can I logout from all devices at once?
**A:** Not yet, but you can logout from each session individually. This feature may be added in the future.

### Q: What happens if I logout a session?
**A:** The device is immediately logged out and must login again to access the account.

### Q: Can I see my login history?
**A:** Currently you can see active sessions. A full login history feature may be added in the future.

### Q: Is my data secure?
**A:** Yes! We use industry-standard encryption, secure password hashing (bcrypt), and follow all security best practices.

### Q: What if I don't recognize a session?
**A:** Logout immediately and change your password. Contact support if you suspect unauthorized access.

---

## 🆘 Need Help?

If you have questions or issues:
1. Check the documentation at `docs/SECURITY_FEATURES.md`
2. Review this visual guide
3. Contact support through the help center
4. Report security issues to the admin

---

## 🎉 Summary

The new security features give you:
- 🔍 **Visibility** - See all your active sessions
- 🎛️ **Control** - Logout from any device remotely
- 🔐 **Security** - Strong password requirements
- 📊 **Monitoring** - Track device and location info
- 🚀 **Future-ready** - 2FA coming soon

Stay safe and secure! 🛡️
