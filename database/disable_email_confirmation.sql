-- Disable email confirmation requirement for development
-- In production, you would want to keep email confirmation enabled
UPDATE auth.config
SET confirm_email_on_signup = false
WHERE confirm_email_on_signup = true;
