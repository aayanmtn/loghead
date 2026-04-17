function mapAuthError(error: any): string {
  if (!error) return "Something went wrong";

  switch (error.code) {
    case "USER_NOT_FOUND":
      return "No account found with this email";

    case "INVALID_PASSWORD":
      return "Incorrect password";

    case "EMAIL_ALREADY_EXISTS":
      return "An account with this email already exists";

    case "WEAK_PASSWORD":
      return "Password is too weak";

    case "INVALID_EMAIL":
      return "Please enter a valid email address";

    default:
      return error.message || "Authentication failed";
  }
}

export { mapAuthError };
