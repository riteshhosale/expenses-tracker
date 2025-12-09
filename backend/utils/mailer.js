import nodemailer from 'nodemailer';

// Send email; if credentials are missing or sending fails, log and keep API response flowing.
export const sendEmail = async (to, subject, text) => {
	if (!process.env.EMAIL_USER) return;
	try {
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
		});
		await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
	} catch (err) {
		console.error('Email send failed:', err.message);
	}
};