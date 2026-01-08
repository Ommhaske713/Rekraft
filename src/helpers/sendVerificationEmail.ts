import { transporter } from '@/lib/nodemailer';
import { ApiResponse } from "@/types/ApiResponse";

interface VerificationEmailOptions {
    expiresInMinutes?: number;
    fromName?: string;
    appName?: string;
    logoUrl?: string;
}

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string,
    options?: VerificationEmailOptions
): Promise<ApiResponse> {
    const {
        expiresInMinutes = 10,
        fromName = "Rekraft",
        appName = "Rekraft",
        logoUrl = ""
    } = options || {};

        const digits = verifyCode.split('')
        const formattedCodeHtml = `
                <table role="presentation" class="verification-table" cellspacing="0" cellpadding="0">
                    <tr>
                        ${digits
                            .map((d) => `
                            <td style="padding:0 8px; font-family: monospace, monospace; font-size:32px; color:#2A4365; font-weight:700; text-align:center; vertical-align:middle;">${d || '&nbsp;'}</td>
                        `)
                            .join('')}
                    </tr>
                </table>
            `
    const currentYear = new Date().getFullYear();

    try {
        const mailOptions = {
            from: `"${fromName}" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Rekraft Account',
            text: `Hello ${username},

Your verification code is: ${verifyCode}

This code will expire in ${expiresInMinutes} minutes.

For security:
- Never share this code with anyone
- Our team will never ask for your code
- Enter the code on our website only

If you didn't request this code, please ignore this email or contact support if you're concerned.

Thank you for joining Rekraft, your marketplace for quality second-hand construction materials and equipment!

${appName} Team`,
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Verify Your Rekraft Account</title>
    <style>
        @media (prefers-color-scheme: dark) {
            .email-container {
                background-color: #1a1a1a !important;
                border-color: #2a2a2a !important;
            }
            .email-body {
                background-color: #1a1a1a !important;
                color: #e0e0e0 !important;
            }
            .greeting, .message {
                color: #e0e0e0 !important;
            }
            .verification-box {
                background-color: #2a2a2a !important;
                border-color: #333333 !important;
            }
            .email-footer {
                background-color: #1a1a1a !important;
                color: #888888 !important;
                border-color: #333333 !important;
            }
            .security-notice {
                background-color: #2e2a1f !important;
                border-color: #6b5d3d !important;
            }
            .security-notice h4, .security-notice ul {
                color: #e0c677 !important;
            }
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            -webkit-font-smoothing: antialiased;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #e0e0e0;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }
        .email-header {
            background: linear-gradient(to right, #2A4365, #1E3A8A);
            color: #ffffff;
            padding: 30px 30px;
            text-align: center;
        }
        .email-header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .email-body {
            padding: 30px;
            background-color: #ffffff;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .message {
            margin-bottom: 30px;
            color: #555;
            font-size: 16px;
        }
        .verification-box {
            background-color: #f0f4f8;
            border-radius: 8px;
            padding: 25px;
            text-align: center;
            margin: 25px 0;
            border: 1px solid #d0dae5;
        }
        .verification-code {
            letter-spacing: 0;
            font-size: 32px;
            font-weight: bold;
            color: #2A4365;
            margin: 15px 0;
            font-family: monospace;
            padding: 10px;
            white-space: nowrap;
            display: inline-block;
        }
        .verification-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin: 0 auto;
        }
        .verification-table td {
            padding: 0 8px;
            font-family: monospace, monospace;
            font-size: 32px;
            color: #2A4365;
            font-weight: 700;
            text-align: center;
            vertical-align: middle;
            width: 16.6667%;
        }
        @media only screen and (max-width: 420px) {
            .verification-table td {
                font-size: 20px !important;
                padding: 0 6px !important;
            }
            .verification-box {
                padding: 18px !important;
            }
        }
        .expiry-note {
            font-size: 14px;
            color: #777;
            margin-top: 10px;
        }
        .security-notice {
            background-color: #f8f5ec;
            border-left: 4px solid #e09d3f;
            padding: 15px;
            margin: 25px 0;
            font-size: 14px;
        }
        .security-notice h4 {
            margin-top: 0;
            color: #8d5e24;
        }
        .security-notice ul {
            padding-left: 20px;
            margin-bottom: 0;
            color: #6b5117;
        }
        .email-footer {
            padding: 20px 30px;
            background-color: #f9f9f9;
            color: #666;
            font-size: 14px;
            text-align: center;
            border-top: 1px solid #eaeaea;
        }
        .footer-links {
            margin-top: 10px;
        }
        .footer-links a {
            color: #2A4365;
            text-decoration: none;
            margin: 0 10px;
        }
        .logo {
            margin-bottom: 15px;
        }
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 0;
                width: 100%;
                border-radius: 0;
            }
            .email-body, .email-header, .email-footer {
                padding: 20px 15px;
            }
            .verification-code {
                font-size: 24px;
                letter-spacing: 6px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <div class="logo">
                ${logoUrl ? `<img src="${logoUrl}" alt="${appName} Logo" width="60" height="60" style="display: block; margin: 0 auto;">` : `
                <!-- Logo placeholder with construction theme -->
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; margin: 0 auto;">
                    <rect width="60" height="60" rx="12" fill="white" fill-opacity="0.1"/>
                    <path d="M15 45V15H45V25H35V45H15Z" fill="white" fill-opacity="0.8"/>
                    <path d="M20 25H30V35H20V25Z" fill="#2A4365"/>
                    <path d="M20 15V10H25V15H20Z" fill="#E09D3F"/>
                    <path d="M35 15V10H40V15H35Z" fill="#E09D3F"/>
                    <path d="M25 50H35V45H25V50Z" fill="#E09D3F"/>
                </svg>`}
            </div>
            <h1>Verify Your Rekraft Account</h1>
        </div>
        <div class="email-body">
            <div class="greeting">Hello ${username},</div>
            <div class="message">
                Thank you for joining Rekraft! To start buying and selling quality second-hand construction materials and equipment, please verify your account using the code below.
            </div>
            
            <div class="verification-box">
                <div>Your verification code is:</div>
                <div class="verification-code">${formattedCodeHtml}</div>
                <div class="expiry-note">This code will expire in ${expiresInMinutes} minutes</div>
            </div>
            
            <div class="security-notice">
                <h4>For your security:</h4>
                <ul>
                    <li>Never share this code with anyone</li>
                    <li>Our team will never ask for your code</li>
                    <li>Only enter this code on the official Rekraft website</li>
                </ul>
            </div>
            
            <div class="message">
                If you did not request this verification, please ignore this email or contact our support team if you're concerned.
            </div>
        </div>
        <div class="email-footer">
            <div>&copy; ${currentYear} ${appName} - Your marketplace for quality second-hand construction materials. All rights reserved.</div>
            <div class="footer-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Support</a>
            </div>
        </div>
    </div>
</body>
</html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully: ${info.messageId}`);

        return {
            success: true,
            message: "Verification email sent successfully",
            timestamp: new Date().toISOString(),
            data: {
                messageId: info.messageId
            }
        };
    } catch (emailError: Error | unknown) {
        const error = emailError instanceof Error ? emailError : new Error(String(emailError));
        console.error("Error while sending verification email:", {
            error: error.message,
            stack: error.stack,
            email: email,
            username: username
        });

        return {
            success: false,
            message: "Failed to send verification email",
            timestamp: new Date().toISOString(),
            errors: [{ code: 'EMAIL_ERROR', message: error.message }]
        };
    }
}