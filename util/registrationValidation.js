const validateRegisterInput = (username, email, password, confirmPassword) => {
  const errors = {};

  //filter username
  if (username.trim() === "") {
    errors.username = "Username must not be empty";
  } else if (!/^[a-z0-9]+$/i.test(username)) {
    errors.username = "Username must only contain alphanumeric characters";
  }

  // TODO: add email validation to make sure it is a valid email address
  if (email.trim() === "") {
    errors.email = "Email must not be empty";
  } else {
    const regex =
      /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regex)) {
      errors.email = "Email must be a valid email address";
    }
  }

  // Password complexity validation
  if (password === "") {
    errors.password = "Password must not be empty";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters long";
  } else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    errors.password =
      "Password must contain both uppercase and lowercase letters";
  } else if (!/[0-9]/.test(password)) {
    errors.password = "Password must include at least one number";
  } else if (!/[!@#$%^&*]/.test(password)) {
    errors.password =
      "Password must contain a special character (e.g., !@#$%^&*)";
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords must match";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

export default validateRegisterInput;
